using DocumentFormat.OpenXml.Office2010.Excel;
using DocumentFormat.OpenXml.Wordprocessing;
using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;
using System.Text.Json;

namespace ERP.Controllers.JobworkInward
{
    public class ServiceOrderController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();
        // Service Order
        Int32? SOPageNumber;
        Int32 SOPageSize;
        List<ServiceOrderDetailed_DTO> SOD_List = new List<ServiceOrderDetailed_DTO>();
        List<ServiceOrderSummary_DTO> SOS_List = new List<ServiceOrderSummary_DTO>();
        ServiceOrderSummary_DTO SOS_DTO = new ServiceOrderSummary_DTO();
        ServiceOrder_DAO SO_DAO = new ServiceOrder_DAO();
        ServiceOrder_DL SO_DL = new ServiceOrder_DL();
        #region date chnage

        [HttpGet]
        [Route("serviceorder/transactions/serviceorder/numbering")]
        public string OnServiceOrderNumber(Int32 PODate)
        {
            JI_ServiceOrder_DTO SO_DTO = new JI_ServiceOrder_DTO();

            DateTime regDate = DateTime.ParseExact(
                PODate.ToString(),
                "yyyyMMdd",
                CultureInfo.InvariantCulture);


            SO_DTO.Header.JISVOH_RegDate = regDate;
            SO_DTO.Header.SVO_Id = 0;

            ServiceOrder_DAO SO_DAO = new ServiceOrder_DAO();
            DS = SO_DAO.ServiceOrderDB(SO_DTO);

            if (DS.Tables[0].Rows.Count == 0 || DS.Tables[1].Rows.Count == 0)
            {
                ViewBag.ErrorCode = 2;
                ViewBag.ErrorMessage = "Service Order Number is not configured for the selected Registration Date.";
                return "";
            }

            // Manual Numbering
            int order = Convert.ToInt32(DS.Tables[0].Rows[0]["JSON_Method"]);
            if (order != 2)
                return "";

            string prefix = "";
            string suffix = "";
            string prefill = "";
            int number = 0;

            // Prefix
            if (DS.Tables[2].Rows.Count > 0)
                prefix = DS.Tables[2].Rows[0]["JSOP_Particulars"].ToString();

            // Suffix
            if (DS.Tables[3].Rows.Count > 0)
                suffix = DS.Tables[3].Rows[0]["JSOS_Particulars"].ToString();

            // Reset Configuration
            int startNumber = Convert.ToInt32(DS.Tables[1].Rows[0]["JSOR_StartingNumber"]);
            int digit = Convert.ToInt32(DS.Tables[1].Rows[0]["JSOR_NumberofDigits"]);
            int prefillZero = Convert.ToInt32(DS.Tables[1].Rows[0]["JSOR_PrefilZero"]);

            if (prefillZero == 1)
                prefill = "D" + digit;

            // Running Number
            if (DS.Tables[4].Rows.Count > 0)
            {
                int runningNumber = Convert.ToInt32(DS.Tables[4].Rows[0]["StartingNumber"]);
                number = runningNumber + 1;
            }
            else
            {
                number = startNumber;
            }

            return prefix + number.ToString(prefill) + suffix;
        }

        #endregion
        [HttpGet]
        [Route("serviceorder/transactions/serviceorder/next-jso-number")]
        public string OnServiceOrderNextNumber(DateTime JSODate, string OrderType)
        {
            try
            {
                if (OrderType == "FREIGHT") 
                {
                    var dto = new JIFRT_SVO_NextNumber_DTO { JIFRT_SVO_Date = JSODate, Id = 101, CreatorCode = 0 };
                    dto = new JIFRT_SVO_NextNumber_DAO().JIFRT_SVO_NextNumberDB(dto);
                    return dto.FinalNumber;
                }
                else // "JWI"
                {
                    var dto = new JIJWI_SVO_NextNumber_DTO { JIJWI_SVO_Date = JSODate, Id = 101, CreatorCode = 0 };
                    dto = new JIJWI_SVO_NextNumber_DAO().JIJWI_SVO_NextNumberDB(dto);
                    return dto.FinalNumber;
                }
            }
            catch (Exception ex)
            {
                ViewBag.ErrorCode = 2;
                ViewBag.ErrorMessage = "Service Order Number is not configured for the selected date.";
                return "";
            }
        }
        [HttpPost]
        public IActionResult UpdateServiceOrder([FromBody] ServiceOrderUpdatePage_DTO model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.ServiceType))
                {
                    return Json(new { success = false, message = "Invalid request" });
                }

                ServiceOrder_DAO serviceOrderDAO = new ServiceOrder_DAO();

                if (model.ServiceType == "FREIGHT")
                {
                    if (model.FreightHeader == null)
                        return Json(new { success = false, message = "Header is null" });

                    if (model.FreightHeader.JIFRT_SVOH_Number <= 0)
                        return Json(new { success = false, message = "Invalid Service Order Number" });

                    string freightError = ValidateFreightUpdate(model, serviceOrderDAO);
                    if (freightError != null)
                        return Json(new { success = false, message = freightError });

                    var freightDto = new JIFRT_ServiceOrder_DTO
                    {
                        Header = model.FreightHeader,
                        Items = model.FreightItems
                    };

                    NormalizeDates(model.FreightHeader);
                    serviceOrderDAO.JIFRT_ServiceOrderUpdateDB(freightDto);
                }
                else // "JWI"
                {
                    if (model.JWIHeader == null)
                        return Json(new { success = false, message = "Header is null" });

                    if (model.JWIHeader.JIJWI_SVOH_Number <= 0)
                        return Json(new { success = false, message = "Invalid Service Order Number" });

                    string jwiError = ValidateJWIUpdate(model, serviceOrderDAO);
                    if (jwiError != null)
                        return Json(new { success = false, message = jwiError });

                    var jwiDto = new JIJWI_ServiceOrder_DTO
                    {
                        Header = model.JWIHeader,
                        Items = model.JWIItems
                    };

                    NormalizeDates(model.JWIHeader, model.JWIItems);
                    serviceOrderDAO.JIJWI_ServiceOrderUpdateDB(jwiDto);
                }

                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action("Index", "ServiceOrder")
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
        [HttpPost]
        public IActionResult SaveServiceOrder(
[FromBody] ServiceOrderCreatePage_DTO model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.ServiceType))
                {
                    return Json(new
                    {
                        success = false,
                        message = "Invalid request"
                    });
                }

                ServiceOrder_DAO serviceOrderDAO =
                    new ServiceOrder_DAO();

                DateTime regDate;

                if (model.ServiceType == "FREIGHT")
                {
                    if (model.FreightHeader == null)
                    {
                        return Json(new { success = false, message = "Header is null" });
                    }

                    var freightDto = new JIFRT_ServiceOrder_DTO
                    {
                        Header = model.FreightHeader,
                        Items = model.FreightItems
                    };

                    NormalizeDates(model.FreightHeader);
                    serviceOrderDAO.JIFRT_ServiceOrderInsertDB(freightDto);
                    regDate = model.FreightHeader.JIFRT_SVOH_RegDate;
                }
                else // "JWI"
                {
                    if (model.JWIHeader == null)
                    {
                        return Json(new { success = false, message = "Header is null" });
                    }

                    var jwiDto = new JIJWI_ServiceOrder_DTO
                    {
                        Header = model.JWIHeader,
                        Items = model.JWIItems
                    };
                    NormalizeDates(model.JWIHeader, model.JWIItems);
                    serviceOrderDAO.JIJWI_ServiceOrderInsertDB(jwiDto);
                    regDate = model.JWIHeader.JIJWI_SVOH_RegDate;
                }

                return Json(new
                {
                    success = true,
                    redirectUrl =
                        Url.Action("Index", "ServiceOrder")
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


        #region client date normalisation
        // The browser may send a picked date as a UTC time (toISOString): 20-Sep-2026 in IST arrives as 19-Sep 18:30Z.
        // A value that carries a kind (Utc / Local) is converted back to the IST calendar date; a plain date is left as it is.
        private static DateTime FromClientDate(DateTime d)
        {
            if (d.Kind == DateTimeKind.Unspecified) return d;
            return DateTime.SpecifyKind(d.ToUniversalTime().AddMinutes(330), DateTimeKind.Unspecified);   // IST = UTC + 5:30
        }

        private static DateTime? FromClientDate(DateTime? d) => d.HasValue ? FromClientDate(d.Value) : (DateTime?)null;

        private static void NormalizeDates(JIJWI_ServiceOrderHead_DTO h, List<JIJWI_ServiceOrderItem_DTO> items)
        {
            if (h != null)
            {
                h.JIJWI_SVOH_RegDate = FromClientDate(h.JIJWI_SVOH_RegDate);
                h.JIJWI_SVOH_ServiceOrderDate = FromClientDate(h.JIJWI_SVOH_ServiceOrderDate);
            }
            if (items != null)
                foreach (var i in items)
                    i.JIJWI_SVOI_DeliveryDate = FromClientDate(i.JIJWI_SVOI_DeliveryDate);
        }

        private static void NormalizeDates(JIFRT_ServiceOrderHead_DTO h)
        {
            if (h == null) return;
            h.JIFRT_SVOH_RegDate = FromClientDate(h.JIFRT_SVOH_RegDate);
            h.JIFRT_SVOH_ServiceOrderDate = FromClientDate(h.JIFRT_SVOH_ServiceOrderDate);
        }
        #endregion

        #region update validation (server-side)
        private string ValidateJWIUpdate(ServiceOrderUpdatePage_DTO model, ServiceOrder_DAO dao)
        {
            var h = model.JWIHeader;

            if (string.IsNullOrWhiteSpace(h.JIJWI_SVOH_RegNo))
                return "Register No. is required";
            if (h.JIJWI_SVOH_RegDate == default)
                return "Register Date is required";
            if (string.IsNullOrWhiteSpace(h.JIJWI_SVOH_ServiceOrderNo))
                return "Service Order No. is required";
            if (h.JIJWI_SVOH_ServiceOrderDate == default)
                return "Service Order Date is required";
            if (h.JIJWI_SVOH_JW_Customer_Number <= 0)
                return "JW Customer is required";
            if (h.JIJWI_SVOH_Currency_Number <= 0)
                return "Currency is required";

            if ((h.JIJWI_SVOH_RegNo ?? "").Length > 100) return "Register No. cannot exceed 100 characters";
            if ((h.JIJWI_SVOH_ServiceOrderNo ?? "").Length > 100) return "Service Order No. cannot exceed 100 characters";
            if ((h.JIJWI_SVOH_PaymentTerms ?? "").Length > 50) return "Payment Terms cannot exceed 50 characters";
            if ((h.JIJWI_SVOH_DeliveryTerms ?? "").Length > 50) return "Delivery Terms cannot exceed 50 characters";
            if ((h.JIJWI_SVOH_DeliveryMode ?? "").Length > 50) return "Delivery Mode cannot exceed 50 characters";
            if ((h.JIJWI_SVOH_Tax ?? "").Length > 250) return "Tax cannot exceed 250 characters";
            if ((h.JIJWI_SVOH_TDC ?? "").Length > 250) return "Technical delivery conditions cannot exceed 250 characters";
            if ((h.JIJWI_SVOH_Remarks ?? "").Length > 250) return "Remarks cannot exceed 250 characters";

            var items = model.JWIItems;
            if (items == null || items.Count == 0)
                return "Please add at least one item";

            foreach (var i in items)
            {
                if (i.JIJWI_SVOI_PRS_Number <= 0) return "Process is required";
                if (i.JIJWI_SVOI_Item_Number <= 0) return "Item Code is required";
                if (i.JIJWI_SVOI_UoM_Number <= 0) return "UOM is required";
                if (i.JIJWI_SVOI_Qty <= 0) return "Qty is required";
                if (i.JIJWI_SVOI_UnitPrice <= 0) return "Unit Price is required";

                // Amount is always Qty x Unit Price (client value is not trusted)
                i.JIJWI_SVOI_Amount = Math.Round(
                    i.JIJWI_SVOI_Qty * i.JIJWI_SVOI_UnitPrice, 2, MidpointRounding.AwayFromZero);
            }

            // compare against the saved order
            var saved = dao.JIJWI_GetServiceOrder(h.JIJWI_SVOH_Number);
            if (saved.Header == null || saved.Header.JIJWI_SVOH_Number <= 0)
                return "Service Order not found";

            foreach (var s in saved.Items)
            {
                double usedQty = s.InvoicedQty + s.InvoiceToBeRaised;
                var posted = items.FirstOrDefault(x => x.JIJWI_SVOI_Number == s.JIJWI_SVOI_Number);

                if (posted == null)
                {
                    if (usedQty > 0)
                        return "Item " + s.JIJWI_SVOI_Item_Code + " has invoiced / pending invoice qty and cannot be deleted";
                    continue;
                }

                if (posted.JIJWI_SVOI_Qty < usedQty)
                    return "Amend Qty for item " + s.JIJWI_SVOI_Item_Code + " cannot be less than " + usedQty;
            }


            return null;
        }

        private string ValidateFreightUpdate(ServiceOrderUpdatePage_DTO model, ServiceOrder_DAO dao)
        {
            var h = model.FreightHeader;

            if (string.IsNullOrWhiteSpace(h.JIFRT_SVOH_RegNo))
                return "Register No. is required";
            if (h.JIFRT_SVOH_RegDate == default)
                return "Register Date is required";
            if (string.IsNullOrWhiteSpace(h.JIFRT_SVOH_ServiceOrderNo))
                return "Service Order No. is required";
            if (h.JIFRT_SVOH_ServiceOrderDate == default)
                return "Service Order Date is required";
            if (h.JIFRT_SVOH_JW_Customer_Number <= 0)
                return "JW Customer is required";
            if (h.JIFRT_SVOH_Currency_Number <= 0)
                return "Currency is required";

            if ((h.JIFRT_SVOH_RegNo ?? "").Length > 100) return "Register No. cannot exceed 100 characters";
            if ((h.JIFRT_SVOH_ServiceOrderNo ?? "").Length > 100) return "Service Order No. cannot exceed 100 characters";
            if ((h.JIFRT_SVOH_PaymentTerms ?? "").Length > 50) return "Payment Terms cannot exceed 50 characters";
            if ((h.JIFRT_SVOH_DeliveryTerms ?? "").Length > 50) return "Delivery Terms cannot exceed 50 characters";
            if ((h.JIFRT_SVOH_DeliveryMode ?? "").Length > 50) return "Delivery Mode cannot exceed 50 characters";
            if ((h.JIFRT_SVOH_Tax ?? "").Length > 250) return "Tax cannot exceed 250 characters";
            if ((h.JIFRT_SVOH_TDC ?? "").Length > 250) return "Technical delivery conditions cannot exceed 250 characters";
            if ((h.JIFRT_SVOH_Remarks ?? "").Length > 250) return "Remarks cannot exceed 250 characters";

            var items = model.FreightItems;
            if (items == null || items.Count == 0)
                return "Please add at least one item";

            foreach (var i in items)
            {
                if (i.JIFRT_SVOI_PRS_Number <= 0) return "Process is required";
                if (!i.JIFRT_SVOI_FromWH_Number.HasValue || i.JIFRT_SVOI_FromWH_Number.Value <= 0) return "From WH is required";
                if (!i.JIFRT_SVOI_ToWH_Number.HasValue || i.JIFRT_SVOI_ToWH_Number.Value <= 0) return "To WH is required";
                if (i.JIFRT_SVOI_UoM_Number <= 0) return "UOM is required";
                if (i.JIFRT_SVOI_Qty <= 0) return "Qty is required";
                if (i.JIFRT_SVOI_Rate <= 0) return "Rate is required";

                // Amount is always Qty x Rate (client value is not trusted)
                i.JIFRT_SVOI_Amount = Math.Round(
                    i.JIFRT_SVOI_Qty * i.JIFRT_SVOI_Rate, 2, MidpointRounding.AwayFromZero);
            }

            var saved = dao.JIFRT_GetServiceOrder(h.JIFRT_SVOH_Number);
            if (saved.Header == null || saved.Header.JIFRT_SVOH_Number <= 0)
                return "Service Order not found";

            return null;
        }
        #endregion

        public void GetServiceOrderData()
        {
            JI_ServiceOrder_DTO SVO_DTO = new JI_ServiceOrder_DTO();
            ServiceOrder_DAO SVO_DAO = new ServiceOrder_DAO();

            SVO_DTO.Header.JISVOH_RegDate = DateTime.Now;
            SVO_DTO.Header.SVO_Id = 1;

            DataSet DS = new DataSet();
            DS = SVO_DAO.ServiceOrderDB(SVO_DTO);
            ViewBag.Currency = Help.GetCat(DS.Tables[0]);
            ViewBag.UoM = Help.GetCat(DS.Tables[1]);

            ViewBag.Process = Help.GetCat(DS.Tables[2]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[3]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[4]);
        }
        [Route("jobinward/transactions/service-order/item")]
        public IActionResult SaleItem(String? ItemCode, long? MS)
        {
            JI_ServiceOrder_DTO SI_DTO = new JI_ServiceOrder_DTO();
            ServiceOrder_DAO SVO_DAO = new ServiceOrder_DAO();
            ReceiptNote_DL S_DL = new ReceiptNote_DL();
            DataSet DS = new DataSet();
            if (ItemCode == null)
            {
                ItemCode = "";
            }
            SI_DTO.Header.JISVOH_RegDate = DateTime.Now;
            SI_DTO.Header.JISVOH_MS_Number = MS;
            SI_DTO.Header.JISVOI_Item_Code = Convert.ToString(ItemCode);
            SI_DTO.Header.SVO_Id = 6;
            DS = SVO_DAO.ServiceOrderDB(SI_DTO);
            var Item = S_DL.ItemList(DS.Tables[0]);
            return Json(Item);
        }


        public IActionResult Create()
        {

            GetServiceOrderData();

            ViewBag.Collapse = true;
            return View("~/Views/JobworkInward/ServiceOrder/Create.cshtml");

        }

        // read-only view of a saved order: renders the Edit page in view mode
        public IActionResult ViewOrder(long SI_No, string OrderType)
        {
            GetServiceOrderData();
            ViewBag.Collapse = true;
            ViewBag.SI_No = SI_No;
            ViewBag.OrderType = OrderType;
            ViewBag.IsViewMode = true;

            return View("~/Views/JobworkInward/ServiceOrder/Edit.cshtml");
        }

        // targets of the "View" button in the Job Work / Freight summaries (their POST actions already redirect here)
        public IActionResult JIJWIServiceOrderView(long JIJWISVOH_Number)
        {
            return RedirectToAction("ViewOrder", new { SI_No = JIJWISVOH_Number, OrderType = "JWI" });
        }

        public IActionResult JIFRTServiceOrderView(long JIFRTSVOH_Number)
        {
            return RedirectToAction("ViewOrder", new { SI_No = JIFRTSVOH_Number, OrderType = "FREIGHT" });
        }

        public IActionResult Edit(long SI_No, string OrderType)
        {

            GetServiceOrderData();
            ViewBag.Collapse = true;
            ViewBag.SI_No = SI_No;
            ViewBag.OrderType = OrderType;

            return View("~/Views/JobworkInward/ServiceOrder/Edit.cshtml");

        }
        #region Service Order Summary

        [Route("service-order/transactions/service-order-summary")]
        public IActionResult ServiceOrderSummary(
            string? SortOrder,
            string? Search,
            int? PageNumber,
            int PSize,
            string? PageFilter)
        {
            SOS_List = SOSummaryGetData(
                SortOrder,
                Search,
                PageNumber,
                PSize,
                PageFilter);
            ViewBag.Collapse = true;
            return View("~/Views/JobworkInward/ServiceOrder/RegisterSummary.cshtml",
       PaginatedList_DTO<ServiceOrderSummary_DTO>
       .CreateAsync(SOS_List, SOPageNumber ?? 1, SOPageSize));
        }
        [Route("service-order/transactions/service-order-summary")]
        [HttpPost]
        public IActionResult ServiceOrderSummary(
    string? SortOrder,
    string? Search,
    int? PageNumber,
    int PSize,
    string? PageFilter,
    string? Mode,
    string? SI_No,
    string[] DeleteNumber,
    string selectAllCheckbox)
        {
            ServiceOrderSummary_DTO SO_DTO =
                new ServiceOrderSummary_DTO();

            if (Mode == "Delete")
            {
                SO_DTO.JISVOH_Number =
                    Convert.ToInt64(SI_No);

                SO_DTO.SO_Id = 104;
                SO_DTO.SO_CreatorCode =
                    Convert.ToInt32(1);

                DS = SO_DAO.ServiceOrderSummaryDB(SO_DTO);

                return RedirectToAction("ServiceOrderSummary");
            }

            if (Mode == "View")
            {
                return RedirectToAction("ServiceOrderView", new
                {
                    JISOH_Number = SI_No
                });
            }

            if (Mode == "Edit")
            {
                return RedirectToAction("Edit", new
                {
                    SI_No = SI_No
                });
            }

            SOS_List = SOSummaryGetData(
                SortOrder,
                Search,
                PageNumber,
                PSize,
                PageFilter);
            ViewBag.Collapse = true;
            return View(
                PaginatedList_DTO<ServiceOrderSummary_DTO>
                .CreateAsync(SOS_List, SOPageNumber ?? 1, SOPageSize));
        }
        List<ServiceOrderSummary_DTO> SOSummaryGetData(
    string? SortOrder,
    string? Search,
    int? PageNumber,
    int PSize,
    string? PageFilter)
        {
            SOPageSize = 10;

            SOS_DTO.SO_Id = 1;
            SOS_DTO.SO_CreatorCode =
                Convert.ToInt32(1);

            DS = SO_DAO.ServiceOrderSummaryDB(SOS_DTO);

            SOS_List =
                SO_DL.SOSummaryList(DS.Tables[0]);

            if (string.IsNullOrEmpty(SortOrder))
                SortOrder = "Title_desc";

            if (Convert.ToInt32(PageNumber) == 0)
                SOPageNumber = 1;

            if (PageFilter?.ToLower() == "pagefilter")
                SOPageNumber = 1;

            ViewData["CurrentSort"] = SortOrder;

            ViewData["KeySort"] =
                SortOrder == "Title"
                ? "Title_desc"
                : "Title";

            ViewData["CurrentFilter"] = Search;

            var Key = SOS_List
                .OrderByDescending(x => x.JISVOH_Number);

            if (!string.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>

                    K.JISVOH_ServiceOrderDate.ToString()
                    .ToLower()
                    .Contains(Search.ToLower()) ||

                    K.JISVOH_ServiceOrderNo.ToLower()
                    .Contains(Search.ToLower()) ||

                    K.CUS_Name.ToLower()
                    .Contains(Search.ToLower())

                ).OrderByDescending(x => x.JISVOH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(
                        x => x.JISVOH_ServiceOrderDate);
                    break;

                case "Title":
                    Key = Key.OrderBy(
                        x => x.JISVOH_ServiceOrderDate);
                    break;

                default:
                    Key = Key.OrderByDescending(
                        x => x.JISVOH_Number);
                    break;
            }

            if (PSize != 0)
                SOPageSize = PSize;

            int Record = Key.Count();

            if (PageNumber > 1)
            {
                int RecordPage =
                    (Convert.ToInt32(PageNumber) - 1)
                    * SOPageSize;

                if (Record > RecordPage)
                {
                    SOPageNumber =
                        Convert.ToInt32(PageNumber);
                }
                else
                {
                    double Page =
                        Convert.ToDouble(Record) /
                        Convert.ToDouble(SOPageSize);

                    int PageCount =
                        Convert.ToInt32(
                            Math.Ceiling(Page));

                    SOPageNumber =
                        Convert.ToInt32(PageCount);
                }
            }
            else
            {
                SOPageNumber =
                    Convert.ToInt32(PageNumber) == 0
                    ? 1
                    : Convert.ToInt32(PageNumber);
            }

            double Pages =
                Convert.ToDouble(Record) /
                Convert.ToDouble(SOPageSize);

            int PageCounts =
                Convert.ToInt32(Math.Ceiling(Pages));

            ViewBag.SumOfQty =
               DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalQty"] != DBNull.Value
                   ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalQty"])
                   : 0;
            ViewBag.SumOfAmount =
      DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalAmount"] != DBNull.Value
          ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalAmount"])
          : 0;
            ViewBag.SumOfItem =
            DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalItems"] != DBNull.Value
                ? Convert.ToInt32(DS.Tables[1].Rows[0]["TotalItems"])
                : 0;

            ViewBag.Page =
                Help.PageSize(PSize.ToString());

            ViewData["PageNumber"] =
                SOPageNumber;

            ViewData["PageSize"] =
                SOPageSize;

            ViewData["PageCount"] =
                PageCounts;

            ViewData["TotalSize"] =
                Key.Count();

            return Key.ToList();
        }
        #endregion
        #region Service Order Detailed

        [Route("service-order/transactions/service-order-detailed")]
        public IActionResult ServiceOrderDetailed(
            String? SortOrder,
            String? Search,
            Int32? PageNumber,
            Int32 PSize,
            String? PageFilter)
        {
            SOD_List = SODetailedGetData(
                SortOrder,
                Search,
                PageNumber,
                PSize,
                PageFilter);
            ViewBag.Collapse = true;
            return View("~/Views/JobworkInward/ServiceOrder/RegisterDetail.cshtml",
                PaginatedList_DTO<ServiceOrderDetailed_DTO>
                .CreateAsync(SOD_List, SOPageNumber ?? 1, SOPageSize));
        }

        [Route("service-order/transactions/service-order-detailed")]
        [HttpPost]
        public IActionResult ServiceOrderDetailed(
            String? SortOrder,
            String? Search,
            Int32? PageNumber,
            Int32 PSize,
            String? PageFilter,
            String? Mode,
            String? DeleteNumbers,
            String? SO_No,
            String[] DeleteNumber,
            String selectAllCheckbox)
        {
            ServiceOrderSummary_DTO SO_DTO =
                new ServiceOrderSummary_DTO();

            if (Mode == "Delete")
            {
                SO_DTO.JISVOH_Number =
                    Convert.ToInt64(SO_No);

                SO_DTO.SO_Id = 104;

                SO_DTO.SO_CreatorCode =
                    Convert.ToInt32(1);

                DS = SO_DAO.ServiceOrderSummaryDB(SO_DTO);

                return RedirectToAction("ServiceOrderDetailed");
            }

            SOD_List = SODetailedGetData(
                SortOrder,
                Search,
                PageNumber,
                PSize,
                PageFilter);

            return View(
                PaginatedList_DTO<ServiceOrderDetailed_DTO>
                .CreateAsync(SOD_List, SOPageNumber ?? 1, SOPageSize));
        }

        List<ServiceOrderDetailed_DTO> SODetailedGetData(
            String? SortOrder,
            String? Search,
            Int32? PageNumber,
            Int32 PSize,
            String? PageFilter)
        {
            SOPageSize = 10;

            SOS_DTO.SO_Id = 2;

            SOS_DTO.SO_CreatorCode =
                Convert.ToInt32(1);

            DS = SO_DAO.ServiceOrderSummaryDB(SOS_DTO);

            SOD_List =
                SO_DL.SODetailedList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder))
            {
                SortOrder = "Title_desc";
            }

            if (Convert.ToInt32(PageNumber) == 0)
            {
                SOPageNumber = 1;
            }

            if (PageFilter?.ToLower() == "pagefilter")
            {
                SOPageNumber = 1;
            }

            ViewData["CurrentSort"] = SortOrder;

            ViewData["KeySort"] =
                SortOrder == "Title"
                ? "Title_desc"
                : "Title";

            ViewData["CurrentFilter"] = Search;

            var Key = SOD_List
                .OrderByDescending(Cs => Cs.JISVOH_Number);

            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>

                    K.JISVOH_ServiceOrderDate
                        .ToString()
                        .ToLower()
                        .Contains(Search.ToLower()) ||

                    K.JISVOH_ServiceOrderNo
                        .ToLower()
                        .Contains(Search.ToLower()) ||

                    K.CUS_Name
                        .ToLower()
                        .Contains(Search.ToLower()) ||

                    K.CurrencyCode
                        .ToLower()
                        .Contains(Search.ToLower())

                ).OrderByDescending(Cs => Cs.JISVOH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(
                        K => K.JISVOH_ServiceOrderDate);
                    break;

                case "Title":
                    Key = Key.OrderBy(
                        K => K.JISVOH_ServiceOrderDate);
                    break;

                default:
                    Key = Key.OrderByDescending(
                        K => K.JISVOH_Number);
                    break;
            }

            if (PSize != 0)
            {
                SOPageSize = PSize;
            }

            Int32 Record = Key.ToList().Count;

            if (PageNumber > 1)
            {
                Int32 RecordPage =
                    (Convert.ToInt32(PageNumber) - 1)
                    * SOPageSize;

                if (Record > RecordPage)
                {
                    SOPageNumber =
                        Convert.ToInt32(PageNumber);
                }
                else
                {
                    Double Page =
                        Convert.ToDouble(Record) /
                        Convert.ToDouble(SOPageSize);

                    Int32 PageCount =
                        Convert.ToInt32(
                            Math.Ceiling(Page));

                    if (PageNumber > PageCount)
                    {
                        SOPageNumber = PageCount;
                    }
                    else
                    {
                        SOPageNumber =
                            Convert.ToInt32(PageNumber);
                    }
                }
            }
            else
            {
                if (Convert.ToInt32(PageNumber) == 0)
                {
                    SOPageNumber = 1;
                }
                else
                {
                    SOPageNumber =
                        Convert.ToInt32(PageNumber);
                }
            }

            Double Pages =
                Convert.ToDouble(Record) /
                Convert.ToDouble(SOPageSize);

            Int32 PageCounts =
                Convert.ToInt32(Math.Ceiling(Pages));

            ViewBag.Page =
                Help.PageSize(PSize.ToString());

            ViewData["PageNumber"] = SOPageNumber;
            ViewData["PageSize"] = SOPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Key.ToList().Count;
            if (DS.Tables.Count > 1 && DS.Tables[1].Rows.Count > 0)
            {
                ViewBag.SumOfQty =
                    Convert.ToDouble(
                        DS.Tables[1].Rows[0]["TotalQty"]);

                ViewBag.SumOfUnitPrice =
                    Convert.ToDouble(
                        DS.Tables[1].Rows[0]["TotalUnitPrice"]);

                ViewBag.SumOfAmount =
                    Convert.ToDouble(
                        DS.Tables[1].Rows[0]["TotalAmount"]);
            }
            else
            {
                ViewBag.SumOfQty = 0;
                ViewBag.SumOfUnitPrice = 0;
                ViewBag.SumOfAmount = 0;
            }
            return Key.ToList();
        }

        #endregion

        [HttpGet]
        public JsonResult GetServiceOrderHead(long customerNumber)
        {

            DataTable dt =
                new ServiceOrder_DAO()
                .GetServiceOrderHead(customerNumber);

            var data = dt.AsEnumerable()
                .Select(r => new
                {
                    Value = r["JISVOH_Number"].ToString(),
                    Text = r["JISVOH_ServiceOrderNo"].ToString()
                });

            return Json(data);
        }

        #region edit
        #region EDIT GET SERVICE ORDER JSON

        [HttpGet]
        public JsonResult GetServiceOrder(long Number, string OrderType)
        {
            ServiceOrder_DAO dao = new ServiceOrder_DAO();

            object result = OrderType == "FREIGHT"
                ? dao.JIFRT_GetServiceOrder(Number)
                : (object)dao.JIJWI_GetServiceOrder(Number);

            return new JsonResult(
                 result,
                 new JsonSerializerOptions
                 {
                     PropertyNamingPolicy = null
                 });
        }

        #endregion
        #endregion

        #region register
        #region JIJWI Service Order Summary
        List<JIJWIServiceOrderSummary_DTO> JIJWISOS_List;
        List<JIJWIServiceOrderDetailed_DTO> JIJWISOD_List;
        JIJWIServiceOrderSummary_DTO JIJWISOS_DTO = new JIJWIServiceOrderSummary_DTO();
        int? JIJWISOPageNumber;
        int JIJWISOPageSize;
        [Route("service-order/JIJWIRegisterDetailtransactions/jijwi-service-order-summary")]
        public IActionResult JIJWIServiceOrderSummary(
            string? SortOrder,
            string? Search,
            int? PageNumber,
            int PSize,
            string? PageFilter)
        {
            JIJWISOS_List = JIJWISOSummaryGetData(
                SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View("~/Views/JobworkInward/ServiceOrder_JobWork/JIJWI_RegisterSummary.cshtml",
                       PaginatedList_DTO<JIJWIServiceOrderSummary_DTO>
                .CreateAsync(JIJWISOS_List, JIJWISOPageNumber ?? 1, JIJWISOPageSize));
        }

        [Route("service-order/transactions/jijwi-service-order-summary")]
        [HttpPost]
        public IActionResult JIJWIServiceOrderSummary(
            string? SortOrder,
            string? Search,
            int? PageNumber,
            int PSize,
            string? PageFilter,
            string? Mode,
            string? SI_No,
            string[] DeleteNumber,
            string selectAllCheckbox)
        {
            JIJWIServiceOrderSummary_DTO SO_DTO = new JIJWIServiceOrderSummary_DTO();

            if (Mode == "Delete")
            {
                SO_DTO.JIJWI_SVOH_Number = Convert.ToInt64(SI_No);
                SO_DTO.SO_Id = 104;
                SO_DTO.SO_CreatorCode = Convert.ToInt32(1);

                DS = SO_DAO.JIJWIServiceOrderSummaryDB(SO_DTO);

                return RedirectToAction("JIJWIServiceOrderSummary");
            }

            if (Mode == "View")
            {
                return RedirectToAction("JIJWIServiceOrderView", new { JIJWISVOH_Number = SI_No });
            }

            if (Mode == "Edit")
            {
                return RedirectToAction("Edit", new { SI_No = SI_No, OrderType = "JWI" });
            }

            JIJWISOS_List = JIJWISOSummaryGetData(
                SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(
                PaginatedList_DTO<JIJWIServiceOrderSummary_DTO>
                .CreateAsync(JIJWISOS_List, JIJWISOPageNumber ?? 1, JIJWISOPageSize));
        }

        List<JIJWIServiceOrderSummary_DTO> JIJWISOSummaryGetData(
            string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter)
        {
            JIJWISOPageSize = 10;

            JIJWISOS_DTO.SO_Id = 1;
            JIJWISOS_DTO.SO_CreatorCode = Convert.ToInt32(1);

            DS = SO_DAO.JIJWIServiceOrderSummaryDB(JIJWISOS_DTO);

            JIJWISOS_List = SO_DL.JIJWISOSummaryList(DS.Tables[0]);

            if (string.IsNullOrEmpty(SortOrder))
                SortOrder = "Title_desc";

            if (Convert.ToInt32(PageNumber) == 0)
                JIJWISOPageNumber = 1;

            if (PageFilter?.ToLower() == "pagefilter")
                JIJWISOPageNumber = 1;

            ViewData["CurrentSort"] = SortOrder;
            ViewData["KeySort"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;

            var Key = JIJWISOS_List.OrderByDescending(x => x.JIJWI_SVOH_Number);

            if (!string.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>
                    K.JIJWI_SVOH_ServiceOrderDate.ToString().ToLower().Contains(Search.ToLower()) ||
                    K.JIJWI_SVOH_ServiceOrderNo.ToLower().Contains(Search.ToLower()) ||
                    K.CUS_Name.ToLower().Contains(Search.ToLower())
                ).OrderByDescending(x => x.JIJWI_SVOH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(x => x.JIJWI_SVOH_ServiceOrderDate);
                    break;
                case "Title":
                    Key = Key.OrderBy(x => x.JIJWI_SVOH_ServiceOrderDate);
                    break;
                default:
                    Key = Key.OrderByDescending(x => x.JIJWI_SVOH_Number);
                    break;
            }

            if (PSize != 0)
                JIJWISOPageSize = PSize;

            int Record = Key.Count();

            if (PageNumber > 1)
            {
                int RecordPage = (Convert.ToInt32(PageNumber) - 1) * JIJWISOPageSize;

                if (Record > RecordPage)
                    JIJWISOPageNumber = Convert.ToInt32(PageNumber);
                else
                {
                    double Page = Convert.ToDouble(Record) / Convert.ToDouble(JIJWISOPageSize);
                    JIJWISOPageNumber = Convert.ToInt32(Math.Ceiling(Page));
                }
            }
            else
            {
                JIJWISOPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
            }

            double Pages = Convert.ToDouble(Record) / Convert.ToDouble(JIJWISOPageSize);
            int PageCounts = Convert.ToInt32(Math.Ceiling(Pages));

            ViewBag.SumOfQty =
                DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalQty"] != DBNull.Value
                    ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalQty"]) : 0;
            ViewBag.SumOfAmount =
                DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalAmount"] != DBNull.Value
                    ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalAmount"]) : 0;
            ViewBag.SumOfItem =
                DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalItems"] != DBNull.Value
                    ? Convert.ToInt32(DS.Tables[1].Rows[0]["TotalItems"]) : 0;

            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewData["PageNumber"] = JIJWISOPageNumber;
            ViewData["PageSize"] = JIJWISOPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Key.Count();

            return Key.ToList();
        }
        #endregion

        #region JIJWI Service Order Detailed

        [Route("service-order/transactions/jijwi-service-order-detailed")]
        public IActionResult JIJWIServiceOrderDetailed(
            String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            JIJWISOD_List = JIJWISODetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View("~/Views/JobworkInward/ServiceOrder_JobWork/JIJWI_RegisterDetail.cshtml",
                   PaginatedList_DTO<JIJWIServiceOrderDetailed_DTO>
                .CreateAsync(JIJWISOD_List, JIJWISOPageNumber ?? 1, JIJWISOPageSize));
        }

        [Route("service-order/transactions/jijwi-service-order-detailed")]
        [HttpPost]
        public IActionResult JIJWIServiceOrderDetailed(
            String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter,
            String? Mode, String? DeleteNumbers, String? SO_No, String[] DeleteNumber, String selectAllCheckbox)
        {
            JIJWIServiceOrderSummary_DTO SO_DTO = new JIJWIServiceOrderSummary_DTO();

            if (Mode == "Delete")
            {
                SO_DTO.JIJWI_SVOH_Number = Convert.ToInt64(SO_No);
                SO_DTO.SO_Id = 104;
                SO_DTO.SO_CreatorCode = Convert.ToInt32(1);

                DS = SO_DAO.JIJWIServiceOrderSummaryDB(SO_DTO);

                return RedirectToAction("JIJWIServiceOrderDetailed");
            }

            JIJWISOD_List = JIJWISODetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);

            return View(
                PaginatedList_DTO<JIJWIServiceOrderDetailed_DTO>
                .CreateAsync(JIJWISOD_List, JIJWISOPageNumber ?? 1, JIJWISOPageSize));
        }

        List<JIJWIServiceOrderDetailed_DTO> JIJWISODetailedGetData(
            String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            JIJWISOPageSize = 10;

            JIJWISOS_DTO.SO_Id = 2;
            JIJWISOS_DTO.SO_CreatorCode = Convert.ToInt32(1);

            DS = SO_DAO.JIJWIServiceOrderSummaryDB(JIJWISOS_DTO);

            JIJWISOD_List = SO_DL.JIJWISODetailedList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder))
                SortOrder = "Title_desc";

            if (Convert.ToInt32(PageNumber) == 0)
                JIJWISOPageNumber = 1;

            if (PageFilter?.ToLower() == "pagefilter")
                JIJWISOPageNumber = 1;

            ViewData["CurrentSort"] = SortOrder;
            ViewData["KeySort"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;

            var Key = JIJWISOD_List.OrderByDescending(Cs => Cs.JIJWI_SVOH_Number);

            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>
                    K.JIJWI_SVOH_ServiceOrderDate.ToString().ToLower().Contains(Search.ToLower()) ||
                    K.JIJWI_SVOH_ServiceOrderNo.ToLower().Contains(Search.ToLower()) ||
                    K.CUS_Name.ToLower().Contains(Search.ToLower()) ||
                    K.CurrencyCode.ToLower().Contains(Search.ToLower())
                ).OrderByDescending(Cs => Cs.JIJWI_SVOH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => K.JIJWI_SVOH_ServiceOrderDate);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => K.JIJWI_SVOH_ServiceOrderDate);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JIJWI_SVOH_Number);
                    break;
            }

            if (PSize != 0)
                JIJWISOPageSize = PSize;

            int Record = Key.Count();

            if (PageNumber > 1)
            {
                int RecordPage = (Convert.ToInt32(PageNumber) - 1) * JIJWISOPageSize;
                if (Record > RecordPage)
                    JIJWISOPageNumber = Convert.ToInt32(PageNumber);
                else
                {
                    double Page = Convert.ToDouble(Record) / Convert.ToDouble(JIJWISOPageSize);
                    JIJWISOPageNumber = Convert.ToInt32(Math.Ceiling(Page));
                }
            }
            else
            {
                JIJWISOPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
            }

            double Pages = Convert.ToDouble(Record) / Convert.ToDouble(JIJWISOPageSize);
            int PageCounts = Convert.ToInt32(Math.Ceiling(Pages));

            ViewBag.SumOfQty =
        DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalQty"] != DBNull.Value
            ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalQty"]) : 0;
            ViewBag.SumOfUnitPrice =
                DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalUnitPrice"] != DBNull.Value
                    ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalUnitPrice"]) : 0;
            ViewBag.SumOfAmount =
                DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalAmount"] != DBNull.Value
                    ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalAmount"]) : 0;

            ViewData["PageNumber"] = JIJWISOPageNumber;
            ViewData["PageSize"] = JIJWISOPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Key.Count();

            return Key.ToList();
        }
        #endregion

        #region JIFRT Service Order Summary
        List<JIFRTServiceOrderSummary_DTO> JIFRTSOS_List;
        List<JIFRTServiceOrderDetailed_DTO> JIFRTSOD_List;
        JIFRTServiceOrderSummary_DTO JIFRTSOS_DTO = new JIFRTServiceOrderSummary_DTO();
        int? JIFRTSOPageNumber;
        int JIFRTSOPageSize;
        [Route("service-order/transactions/jifrt-service-order-summary")]
        public IActionResult JIFRTServiceOrderSummary(
            string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter)
        {
            JIFRTSOS_List = JIFRTSOSummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View("~/Views/JobworkInward/ServiceOrder_Freight/JIFRT_RegisterSummary.cshtml",
                 PaginatedList_DTO<JIFRTServiceOrderSummary_DTO>
                .CreateAsync(JIFRTSOS_List, JIFRTSOPageNumber ?? 1, JIFRTSOPageSize));
        }

        [Route("service-order/transactions/jifrt-service-order-summary")]
        [HttpPost]
        public IActionResult JIFRTServiceOrderSummary(
            string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter,
            string? Mode, string? SI_No, string[] DeleteNumber, string selectAllCheckbox)
        {
            JIFRTServiceOrderSummary_DTO SO_DTO = new JIFRTServiceOrderSummary_DTO();

            if (Mode == "Delete")
            {
                SO_DTO.JIFRT_SVOH_Number = Convert.ToInt64(SI_No);
                SO_DTO.SO_Id = 104;
                SO_DTO.SO_CreatorCode = Convert.ToInt32(1);

                DS = SO_DAO.JIFRTServiceOrderSummaryDB(SO_DTO);

                return RedirectToAction("JIFRTServiceOrderSummary");
            }

            if (Mode == "View")
            {
                return RedirectToAction("JIFRTServiceOrderView", new { JIFRTSVOH_Number = SI_No });
            }
            if (Mode == "Edit")
            {
                return RedirectToAction("Edit", new { SI_No = SI_No, OrderType = "FREIGHT" });
            }

            JIFRTSOS_List = JIFRTSOSummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(
                PaginatedList_DTO<JIFRTServiceOrderSummary_DTO>
                .CreateAsync(JIFRTSOS_List, JIFRTSOPageNumber ?? 1, JIFRTSOPageSize));
        }

        List<JIFRTServiceOrderSummary_DTO> JIFRTSOSummaryGetData(
            string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter)
        {
            JIFRTSOPageSize = 10;

            JIFRTSOS_DTO.SO_Id = 1;
            JIFRTSOS_DTO.SO_CreatorCode = Convert.ToInt32(1);

            DS = SO_DAO.JIFRTServiceOrderSummaryDB(JIFRTSOS_DTO);

            JIFRTSOS_List = SO_DL.JIFRTSOSummaryList(DS.Tables[0]);

            if (string.IsNullOrEmpty(SortOrder))
                SortOrder = "Title_desc";

            if (Convert.ToInt32(PageNumber) == 0)
                JIFRTSOPageNumber = 1;

            if (PageFilter?.ToLower() == "pagefilter")
                JIFRTSOPageNumber = 1;

            ViewData["CurrentSort"] = SortOrder;
            ViewData["KeySort"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;

            var Key = JIFRTSOS_List.OrderByDescending(x => x.JIFRT_SVOH_Number);

            if (!string.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>
                    K.JIFRT_SVOH_ServiceOrderDate.ToString().ToLower().Contains(Search.ToLower()) ||
                    K.JIFRT_SVOH_ServiceOrderNo.ToLower().Contains(Search.ToLower()) ||
                    K.CUS_Name.ToLower().Contains(Search.ToLower())
                ).OrderByDescending(x => x.JIFRT_SVOH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(x => x.JIFRT_SVOH_ServiceOrderDate);
                    break;
                case "Title":
                    Key = Key.OrderBy(x => x.JIFRT_SVOH_ServiceOrderDate);
                    break;
                default:
                    Key = Key.OrderByDescending(x => x.JIFRT_SVOH_Number);
                    break;
            }

            if (PSize != 0)
                JIFRTSOPageSize = PSize;

            int Record = Key.Count();

            if (PageNumber > 1)
            {
                int RecordPage = (Convert.ToInt32(PageNumber) - 1) * JIFRTSOPageSize;
                if (Record > RecordPage)
                    JIFRTSOPageNumber = Convert.ToInt32(PageNumber);
                else
                {
                    double Page = Convert.ToDouble(Record) / Convert.ToDouble(JIFRTSOPageSize);
                    JIFRTSOPageNumber = Convert.ToInt32(Math.Ceiling(Page));
                }
            }
            else
            {
                JIFRTSOPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
            }

            double Pages = Convert.ToDouble(Record) / Convert.ToDouble(JIFRTSOPageSize);
            int PageCounts = Convert.ToInt32(Math.Ceiling(Pages));

            ViewBag.SumOfQty =
                DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalQty"] != DBNull.Value
                    ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalQty"]) : 0;
            ViewBag.SumOfAmount =
                DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalAmount"] != DBNull.Value
                    ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalAmount"]) : 0;
            ViewBag.SumOfItem =
                DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalItems"] != DBNull.Value
                    ? Convert.ToInt32(DS.Tables[1].Rows[0]["TotalItems"]) : 0;

            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewData["PageNumber"] = JIFRTSOPageNumber;
            ViewData["PageSize"] = JIFRTSOPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Key.Count();

            return Key.ToList();
        }
        #endregion

        #region JIFRT Service Order Detailed

        [Route("service-order/transactions/jifrt-service-order-detailed")]
        public IActionResult JIFRTServiceOrderDetailed(
            String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            JIFRTSOD_List = JIFRTSODetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View("~/Views/JobworkInward/ServiceOrder_Freight/JIFRT_RegisterDetail.cshtml",
                  PaginatedList_DTO<JIFRTServiceOrderDetailed_DTO>
                .CreateAsync(JIFRTSOD_List, JIFRTSOPageNumber ?? 1, JIFRTSOPageSize));
        }

        [Route("service-order/transactions/jifrt-service-order-detailed")]
        [HttpPost]
        public IActionResult JIFRTServiceOrderDetailed(
            String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter,
            String? Mode, String? DeleteNumbers, String? SO_No, String[] DeleteNumber, String selectAllCheckbox)
        {
            JIFRTServiceOrderSummary_DTO SO_DTO = new JIFRTServiceOrderSummary_DTO();

            if (Mode == "Delete")
            {
                SO_DTO.JIFRT_SVOH_Number = Convert.ToInt64(SO_No);
                SO_DTO.SO_Id = 104;
                SO_DTO.SO_CreatorCode = Convert.ToInt32(1);

                DS = SO_DAO.JIFRTServiceOrderSummaryDB(SO_DTO);

                return RedirectToAction("JIFRTServiceOrderDetailed");
            }

            JIFRTSOD_List = JIFRTSODetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);

            return View(
                PaginatedList_DTO<JIFRTServiceOrderDetailed_DTO>
                .CreateAsync(JIFRTSOD_List, JIFRTSOPageNumber ?? 1, JIFRTSOPageSize));
        }

        List<JIFRTServiceOrderDetailed_DTO> JIFRTSODetailedGetData(
            String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            JIFRTSOPageSize = 10;

            JIFRTSOS_DTO.SO_Id = 2;
            JIFRTSOS_DTO.SO_CreatorCode = Convert.ToInt32(1);

            DS = SO_DAO.JIFRTServiceOrderSummaryDB(JIFRTSOS_DTO);

            JIFRTSOD_List = SO_DL.JIFRTSODetailedList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder))
                SortOrder = "Title_desc";

            if (Convert.ToInt32(PageNumber) == 0)
                JIFRTSOPageNumber = 1;

            if (PageFilter?.ToLower() == "pagefilter")
                JIFRTSOPageNumber = 1;

            ViewData["CurrentSort"] = SortOrder;
            ViewData["KeySort"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;

            var Key = JIFRTSOD_List.OrderByDescending(Cs => Cs.JIFRT_SVOH_Number);

            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>
                    K.JIFRT_SVOH_ServiceOrderDate.ToString().ToLower().Contains(Search.ToLower()) ||
                    K.JIFRT_SVOH_ServiceOrderNo.ToLower().Contains(Search.ToLower()) ||
                    K.CUS_Name.ToLower().Contains(Search.ToLower()) ||
                    K.CurrencyCode.ToLower().Contains(Search.ToLower())
                ).OrderByDescending(Cs => Cs.JIFRT_SVOH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => K.JIFRT_SVOH_ServiceOrderDate);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => K.JIFRT_SVOH_ServiceOrderDate);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JIFRT_SVOH_Number);
                    break;
            }

            if (PSize != 0)
                JIFRTSOPageSize = PSize;

            int Record = Key.Count();

            if (PageNumber > 1)
            {
                int RecordPage = (Convert.ToInt32(PageNumber) - 1) * JIFRTSOPageSize;
                if (Record > RecordPage)
                    JIFRTSOPageNumber = Convert.ToInt32(PageNumber);
                else
                {
                    double Page = Convert.ToDouble(Record) / Convert.ToDouble(JIFRTSOPageSize);
                    JIFRTSOPageNumber = Convert.ToInt32(Math.Ceiling(Page));
                }
            }
            else
            {
                JIFRTSOPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
            }

            double Pages = Convert.ToDouble(Record) / Convert.ToDouble(JIFRTSOPageSize);
            int PageCounts = Convert.ToInt32(Math.Ceiling(Pages));

            ViewBag.SumOfQty =
     DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalQty"] != DBNull.Value
         ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalQty"]) : 0;
            ViewBag.SumOfRate =
                DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalRate"] != DBNull.Value
                    ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalRate"]) : 0;
            ViewBag.SumOfAmount =
                DS.Tables[1].Rows.Count > 0 && DS.Tables[1].Rows[0]["TotalAmount"] != DBNull.Value
                    ? Convert.ToDouble(DS.Tables[1].Rows[0]["TotalAmount"]) : 0;

            ViewData["PageNumber"] = JIFRTSOPageNumber;
            ViewData["PageSize"] = JIFRTSOPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Key.Count();

            return Key.ToList();
        }
        #endregion

        #endregion

    }
}