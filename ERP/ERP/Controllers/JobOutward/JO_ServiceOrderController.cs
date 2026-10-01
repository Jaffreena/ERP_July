using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;
using ERP_DTO;

namespace ERP.Controllers.JobOutward
{
    public class JO_ServiceOrderController : Controller
    {
        Help Help = new Help();
        JO_ServiceOrder_DAO JO_DAO = new JO_ServiceOrder_DAO();
        JO_ServiceOrder_DL JO_DL = new JO_ServiceOrder_DL();

        #region page data (dropdowns)

        public void GetJOServiceOrderData()
        {
            DataSet DS = JO_DAO.JO_ServiceOrderLookupDB(1, "", "", null);

            ViewBag.Currency = Help.GetCat(DS.Tables[0]);
            ViewBag.UoM = Help.GetCat(DS.Tables[1]);
            ViewBag.Process = Help.GetCat(DS.Tables[2]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[3]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[4]);
        }

        #endregion

        #region lookups

        // JW Vendor search
        [HttpGet]
        [Route("joboutward/transactions/jo-service-order/vendor")]
        public IActionResult JW_VendorSearch(string? JW_Vendor)
        {
            DataSet DS = JO_DAO.JO_ServiceOrderLookupDB(5, JW_Vendor ?? "", "", null);

            var data = DS.Tables[0].AsEnumerable().Select(r => new
            {
                JWV_Number = r["JWV_Number"],
                JWV_JW_VendorName = r["JWV_JW_VendorName"],
                JWV_Currency_Number = r["JWV_Currency_Number"],
                CurrencyCode = r["CurrencyCode"]
            });

            return Json(data);
        }

        // Item search (filtered by Material Segregation)
        [HttpGet]
        [Route("joboutward/transactions/jo-service-order/item")]
        public IActionResult JO_Item(string? ItemCode, long? MS)
        {
            DataSet DS = JO_DAO.JO_ServiceOrderLookupDB(6, "", ItemCode ?? "", MS);

            DataTable dtItem = DS.Tables[0];
            if (!dtItem.Columns.Contains("HSN_Code")) dtItem.Columns.Add("HSN_Code", typeof(string));
            if (!dtItem.Columns.Contains("SaleWarehouse")) dtItem.Columns.Add("SaleWarehouse", typeof(int));

            // NULL int values -> 0 (ItemList uses Convert.ToInt32)
            foreach (DataRow r in dtItem.Rows)
            {
                if (r["DecimalPlaces"] == DBNull.Value) r["DecimalPlaces"] = 0;
                if (r["SaleWarehouse"] == DBNull.Value) r["SaleWarehouse"] = 0;
            }

            var Item = new ReceiptNote_DL().ItemList(dtItem);
            return Json(Item);
        }

        #endregion

        #region next number

        // Auto Service Order No for the picked date
        [HttpGet]
        [Route("joboutward/transactions/jo-service-order/next-number")]
        public IActionResult JO_NextNumber(DateTime SODate, string OrderType)
        {
            try
            {
                string number;
                if (OrderType == "FREIGHT")
                {
                    var dto = new JOFRT_SVO_NextNumber_DTO { JOFRT_SVO_Date = SODate.Date, Id = 101, CreatorCode = 0 };
                    number = JO_DAO.JOFRT_SVO_NextNumberDB(dto).FinalNumber;
                }
                else // "JWI"
                {
                    var dto = new JOJWI_SVO_NextNumber_DTO { JOJWI_SVO_Date = SODate.Date, Id = 101, CreatorCode = 0 };
                    number = JO_DAO.JOJWI_SVO_NextNumberDB(dto).FinalNumber;
                }
                return Json(new { success = true, number = number });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "Service Order Number is not configured for the selected date." });
            }
        }

        #endregion

        #region save / update / get

        [HttpPost]
        [Route("joboutward/transactions/jo-service-order/save")]
        public IActionResult SaveJOServiceOrder([FromBody] JO_ServiceOrderCreatePage_DTO model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.ServiceType))
                    return Json(new { success = false, message = "Invalid request" });

                if (model.ServiceType == "FREIGHT")
                {
                    if (model.FreightHeader == null)
                        return Json(new { success = false, message = "Header is null" });

                    string err = ValidateFreight(model.FreightHeader, model.FreightItems);
                    if (err != null)
                        return Json(new { success = false, message = err });

                    NormalizeDates(model.FreightHeader);
                    JO_DAO.JOFRT_ServiceOrderInsertDB(new JOFRT_ServiceOrder_DTO
                    {
                        Header = model.FreightHeader,
                        Items = model.FreightItems
                    });
                }
                else // "JWI"
                {
                    if (model.JWIHeader == null)
                        return Json(new { success = false, message = "Header is null" });

                    string err = ValidateJWI(model.JWIHeader, model.JWIItems);
                    if (err != null)
                        return Json(new { success = false, message = err });

                    NormalizeDates(model.JWIHeader, model.JWIItems);
                    JO_DAO.JOJWI_ServiceOrderInsertDB(new JOJWI_ServiceOrder_DTO
                    {
                        Header = model.JWIHeader,
                        Items = model.JWIItems
                    });
                }

                return Json(new
                {
                    success = true,
                    redirectUrl = model.ServiceType == "FREIGHT"
          ? "/joboutward/transactions/jo-service-order/freight-summary"
          : "/joboutward/transactions/jo-service-order/jwi-summary"
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Route("joboutward/transactions/jo-service-order/update")]
        public IActionResult UpdateJOServiceOrder([FromBody] JO_ServiceOrderUpdatePage_DTO model)
        {
            try
            {
                if (model == null || string.IsNullOrEmpty(model.ServiceType))
                    return Json(new { success = false, message = "Invalid request" });

                if (model.ServiceType == "FREIGHT")
                {
                    if (model.FreightHeader == null)
                        return Json(new { success = false, message = "Header is null" });
                    if (model.FreightHeader.JOFRT_SVOH_Number <= 0)
                        return Json(new { success = false, message = "Invalid Service Order Number" });

                    string err = ValidateFreight(model.FreightHeader, model.FreightItems);
                    if (err != null)
                        return Json(new { success = false, message = err });

                    var saved = JO_DAO.JOFRT_GetServiceOrder(model.FreightHeader.JOFRT_SVOH_Number);
                    if (saved.Header == null || saved.Header.JOFRT_SVOH_Number <= 0)
                        return Json(new { success = false, message = "Service Order not found" });

                    string amendErr = ValidateFreightAmend(saved, model.FreightItems);
                    if (amendErr != null)
                        return Json(new { success = false, message = amendErr });

                    NormalizeDates(model.FreightHeader);
                    JO_DAO.JOFRT_ServiceOrderUpdateDB(new JOFRT_ServiceOrder_DTO
                    {
                        Header = model.FreightHeader,
                        Items = model.FreightItems
                    });
                }
                else // "JWI"
                {
                    if (model.JWIHeader == null)
                        return Json(new { success = false, message = "Header is null" });
                    if (model.JWIHeader.JOJWI_SVOH_Number <= 0)
                        return Json(new { success = false, message = "Invalid Service Order Number" });

                    string err = ValidateJWI(model.JWIHeader, model.JWIItems);
                    if (err != null)
                        return Json(new { success = false, message = err });

                    var saved = JO_DAO.JOJWI_GetServiceOrder(model.JWIHeader.JOJWI_SVOH_Number);
                    if (saved.Header == null || saved.Header.JOJWI_SVOH_Number <= 0)
                        return Json(new { success = false, message = "Service Order not found" });

                    string amendErr = ValidateJWIAmend(saved, model.JWIItems);
                    if (amendErr != null)
                        return Json(new { success = false, message = amendErr });

                    NormalizeDates(model.JWIHeader, model.JWIItems);
                    JO_DAO.JOJWI_ServiceOrderUpdateDB(new JOJWI_ServiceOrder_DTO
                    {
                        Header = model.JWIHeader,
                        Items = model.JWIItems
                    });
                }

                return Json(new
                {
                    success = true,
                    redirectUrl = model.ServiceType == "FREIGHT"
           ? "/joboutward/transactions/jo-service-order/freight-summary"
           : "/joboutward/transactions/jo-service-order/jwi-summary"
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("joboutward/transactions/jo-service-order/get")]
        public JsonResult GetJOServiceOrder(long Number, string OrderType)
        {
            object result = OrderType == "FREIGHT"
                ? JO_DAO.JOFRT_GetServiceOrder(Number)
                : (object)JO_DAO.JOJWI_GetServiceOrder(Number);

            return new JsonResult(result, new JsonSerializerOptions { PropertyNamingPolicy = null });
        }

        #endregion

        #region amend qty validation (Update only, compares with the saved order)

        private string ValidateJWIAmend(JOJWI_ServiceOrder_DTO saved, List<JOJWI_ServiceOrderItem_DTO> items)
        {
            foreach (var s in saved.Items)
            {
                double usedQty = s.InvoicedQty + s.InvoiceToBeRaised;
                var posted = items.FirstOrDefault(x => x.JOJWI_SVOI_Number == s.JOJWI_SVOI_Number);

                if (posted == null)
                {
                    if (usedQty > 0)
                        return "Item " + s.JOJWI_SVOI_Item_Code + " has invoiced / pending invoice qty and cannot be deleted";
                    continue;
                }

                if (posted.JOJWI_SVOI_Qty < usedQty)
                    return "Amend Qty for item " + s.JOJWI_SVOI_Item_Code + " cannot be less than " + usedQty;
            }
            return null;
        }

        private string ValidateFreightAmend(JOFRT_ServiceOrder_DTO saved, List<JOFRT_ServiceOrderItem_DTO> items)
        {
            int line = 0;
            foreach (var s in saved.Items)
            {
                line++;
                double usedQty = s.InvoicedQty + s.InvoiceToBeRaised;
                var posted = items.FirstOrDefault(x => x.JOFRT_SVOI_Number == s.JOFRT_SVOI_Number);

                if (posted == null)
                {
                    if (usedQty > 0)
                        return "Line " + line + " has invoiced / pending invoice qty and cannot be deleted";
                    continue;
                }

                if (posted.JOFRT_SVOI_Qty < usedQty)
                    return "Amend Qty for line " + line + " cannot be less than " + usedQty;
            }
            return null;
        }

        #endregion

        #region client date normalisation
        // Browser may send a picked date as UTC (toISOString): 20-Sep in IST arrives as 19-Sep 18:30Z.
        // A value carrying a kind (Utc/Local) is converted back to the IST calendar date; a plain date is left as is.
        private static DateTime FromClientDate(DateTime d)
        {
            if (d.Kind == DateTimeKind.Unspecified) return d;
            return DateTime.SpecifyKind(d.ToUniversalTime().AddMinutes(330), DateTimeKind.Unspecified);
        }

        private static DateTime? FromClientDate(DateTime? d) => d.HasValue ? FromClientDate(d.Value) : (DateTime?)null;

        private static void NormalizeDates(JOJWI_ServiceOrderHead_DTO h, List<JOJWI_ServiceOrderItem_DTO> items)
        {
            if (h != null)
                h.JOJWI_SVOH_ServiceOrderDate = FromClientDate(h.JOJWI_SVOH_ServiceOrderDate);
            if (items != null)
                foreach (var i in items)
                    i.JOJWI_SVOI_DeliveryDate = FromClientDate(i.JOJWI_SVOI_DeliveryDate);
        }

        private static void NormalizeDates(JOFRT_ServiceOrderHead_DTO h)
        {
            if (h == null) return;
            h.JOFRT_SVOH_ServiceOrderDate = FromClientDate(h.JOFRT_SVOH_ServiceOrderDate);
        }
        #endregion

        #region server-side validation (Save + Update)

        private string ValidateJWI(JOJWI_ServiceOrderHead_DTO h, List<JOJWI_ServiceOrderItem_DTO> items)
        {
            if (string.IsNullOrWhiteSpace(h.JOJWI_SVOH_ServiceOrderNo)) return "Service Order No. is required";
            if (h.JOJWI_SVOH_ServiceOrderDate == default) return "Service Order Date is required";
            if (h.JOJWI_SVOH_MS_Number <= 0) return "Material Segregation is required";
            if (h.JOJWI_SVOH_JW_Vendor_Number <= 0) return "JW Vendor is required";
            if (h.JOJWI_SVOH_Currency_Number <= 0) return "Currency is required";

            if (h.JOJWI_SVOH_ServiceOrderNo.Length > 25) return "Service Order No. cannot exceed 25 characters";
            if ((h.JOJWI_SVOH_PaymentTerms ?? "").Length > 50) return "Payment Terms cannot exceed 50 characters";
            if ((h.JOJWI_SVOH_DeliveryTerms ?? "").Length > 50) return "Delivery Terms cannot exceed 50 characters";
            if ((h.JOJWI_SVOH_DeliveryMode ?? "").Length > 50) return "Delivery Mode cannot exceed 50 characters";
            if ((h.JOJWI_SVOH_Tax ?? "").Length > 250) return "Tax cannot exceed 250 characters";
            if ((h.JOJWI_SVOH_TDC ?? "").Length > 250) return "Technical delivery conditions cannot exceed 250 characters";
            if ((h.JOJWI_SVOH_Remarks ?? "").Length > 250) return "Remarks cannot exceed 250 characters";

            if (items == null || items.Count == 0) return "Please add at least one item";

            foreach (var i in items)
            {
                if (i.JOJWI_SVOI_JPRS_Number <= 0) return "Process is required";
                if (i.JOJWI_SVOI_Item_Number <= 0) return "Item Code is required";
                if (!i.JOJWI_SVOI_WH_Number.HasValue || i.JOJWI_SVOI_WH_Number.Value <= 0) return "Warehouse is required";
                if (i.JOJWI_SVOI_UoM_Number <= 0) return "UOM is required";
                if (i.JOJWI_SVOI_Qty <= 0) return "Qty is required";
                if (i.JOJWI_SVOI_UnitPrice <= 0) return "Unit Price is required";

                // Amount is always Qty x Unit Price (client value is not trusted)
                i.JOJWI_SVOI_Amount = Math.Round(
                    i.JOJWI_SVOI_Qty * i.JOJWI_SVOI_UnitPrice, 2, MidpointRounding.AwayFromZero);
            }
            return null;
        }

        private string ValidateFreight(JOFRT_ServiceOrderHead_DTO h, List<JOFRT_ServiceOrderItem_DTO> items)
        {
            if (string.IsNullOrWhiteSpace(h.JOFRT_SVOH_ServiceOrderNo)) return "Service Order No. is required";
            if (h.JOFRT_SVOH_ServiceOrderDate == default) return "Service Order Date is required";
            if (string.IsNullOrWhiteSpace(h.JOFRT_SVOH_Category)) return "Category is required";
            if (h.JOFRT_SVOH_JW_Vendor_Number <= 0) return "JW Vendor is required";
            if (h.JOFRT_SVOH_Currency_Number <= 0) return "Currency is required";

            if (h.JOFRT_SVOH_ServiceOrderNo.Length > 25) return "Service Order No. cannot exceed 25 characters";
            if (h.JOFRT_SVOH_Category.Length > 100) return "Category cannot exceed 100 characters";
            if ((h.JOFRT_SVOH_PaymentTerms ?? "").Length > 50) return "Payment Terms cannot exceed 50 characters";
            if ((h.JOFRT_SVOH_DeliveryTerms ?? "").Length > 50) return "Delivery Terms cannot exceed 50 characters";
            if ((h.JOFRT_SVOH_DeliveryMode ?? "").Length > 50) return "Delivery Mode cannot exceed 50 characters";
            if ((h.JOFRT_SVOH_Tax ?? "").Length > 250) return "Tax cannot exceed 250 characters";
            if ((h.JOFRT_SVOH_TDC ?? "").Length > 250) return "Technical delivery conditions cannot exceed 250 characters";
            if ((h.JOFRT_SVOH_Remarks ?? "").Length > 250) return "Remarks cannot exceed 250 characters";

            if (items == null || items.Count == 0) return "Please add at least one item";

            foreach (var i in items)
            {
                if (i.JOFRT_SVOI_JPRS_Number <= 0) return "Process is required";
                if (!i.JOFRT_SVOI_FromWH_Number.HasValue || i.JOFRT_SVOI_FromWH_Number.Value <= 0) return "From WH is required";
                if (!i.JOFRT_SVOI_ToWH_Number.HasValue || i.JOFRT_SVOI_ToWH_Number.Value <= 0) return "To WH is required";
                if (i.JOFRT_SVOI_UoM_Number <= 0) return "UOM is required";
                if (i.JOFRT_SVOI_Qty <= 0) return "Qty is required";
                if (i.JOFRT_SVOI_Rate <= 0) return "Rate is required";

                // Amount is always Qty x Rate (client value is not trusted)
                i.JOFRT_SVOI_Amount = Math.Round(
                    i.JOFRT_SVOI_Qty * i.JOFRT_SVOI_Rate, 2, MidpointRounding.AwayFromZero);
            }
            return null;
        }

        #endregion

        #region register

        private const string RegisterViewPath = "~/Views/JobworkOutward/JO_ServiceOrder/";

        #region register common
        // paging + view data (same rules as the old register)
        private void RegisterPaging(int record, int? PageNumber, int PSize, string? PageFilter,
            string? SortOrder, string? Search, out int pageNo, out int pageSize)
        {
            pageSize = PSize != 0 ? PSize : 10;

            if (PageFilter?.ToLower() == "pagefilter")
                PageNumber = 1;

            if (PageNumber > 1)
            {
                int recordPage = (PageNumber.Value - 1) * pageSize;

                if (record > recordPage)
                    pageNo = PageNumber.Value;
                else
                    pageNo = Math.Max(1, Convert.ToInt32(Math.Ceiling(Convert.ToDouble(record) / pageSize)));
            }
            else
            {
                pageNo = 1;
            }

            int pageCount = Convert.ToInt32(Math.Ceiling(Convert.ToDouble(record) / pageSize));

            ViewData["CurrentSort"] = SortOrder;
            ViewData["KeySort"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;
            ViewData["PageNumber"] = pageNo;
            ViewData["PageSize"] = pageSize;
            ViewData["PageCount"] = pageCount;
            ViewData["TotalSize"] = record;

            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewBag.Collapse = true;
        }

        private static double RegisterTotal(DataSet ds, string col)
        {
            return ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0 && ds.Tables[1].Rows[0][col] != DBNull.Value
                ? Convert.ToDouble(ds.Tables[1].Rows[0][col])
                : 0;
        }

        // View / Edit button -> page (Delete is not enabled yet)
        private IActionResult? RegisterRedirect(string? Mode, string? SI_No, string[]? DeleteNumber, string orderType)
        {
            string no = !string.IsNullOrEmpty(SI_No) ? SI_No : (DeleteNumber?.FirstOrDefault() ?? "");
            no = no.Split(',')[0];

            if (Mode == "View")
                return RedirectToAction("ViewOrder", new { SI_No = no, OrderType = orderType });

            if (Mode == "Edit")
                return RedirectToAction("Edit", new { SI_No = no, OrderType = orderType });

            return null;
        }

        private static bool Has(string? value, string search)
        {
            return (value ?? "").ToLower().Contains(search);
        }
        #endregion register common

        #region JWI Summary
        [HttpGet]
        [Route("joboutward/transactions/jo-service-order/jwi-summary")]
        public IActionResult JOJWI_ServiceOrderSummary(string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter)
        {
            var list = JOJWI_SummaryData(SortOrder, Search, PageNumber, PSize, PageFilter, out int pageNo, out int pageSize);
            return View(RegisterViewPath + "JWI_RegisterSummary.cshtml",
                PaginatedList_DTO<JOJWI_ServiceOrderSummary_DTO>.CreateAsync(list, pageNo, pageSize));
        }

        [HttpPost]
        [Route("joboutward/transactions/jo-service-order/jwi-summary")]
        public IActionResult JOJWI_ServiceOrderSummary(string? SortOrder, string? Search, int? PageNumber, int PSize,
            string? PageFilter, string? Mode, string? SI_No, string[] DeleteNumber)
        {
            var redirect = RegisterRedirect(Mode, SI_No, DeleteNumber, "JWI");
            if (redirect != null) return redirect;

            var list = JOJWI_SummaryData(SortOrder, Search, PageNumber, PSize, PageFilter, out int pageNo, out int pageSize);
            return View(RegisterViewPath + "JWI_RegisterSummary.cshtml",
                PaginatedList_DTO<JOJWI_ServiceOrderSummary_DTO>.CreateAsync(list, pageNo, pageSize));
        }

        private List<JOJWI_ServiceOrderSummary_DTO> JOJWI_SummaryData(string? SortOrder, string? Search, int? PageNumber,
            int PSize, string? PageFilter, out int pageNo, out int pageSize)
        {
            var dto = new JOJWI_ServiceOrderSummary_DTO { SO_Id = 1, SO_CreatorCode = 1 };
            DataSet ds = JO_DAO.JOJWI_ServiceOrderSummaryDB(dto);
            var list = JO_DL.JOJWI_SummaryList(ds.Tables[0]);

            if (string.IsNullOrEmpty(SortOrder)) SortOrder = "Title_desc";

            IEnumerable<JOJWI_ServiceOrderSummary_DTO> q = list;

            if (!string.IsNullOrEmpty(Search))
            {
                string s = Search.ToLower();
                q = q.Where(K =>
                    K.JOJWI_SVOH_ServiceOrderDate.ToString("dd-MMM-yyyy").ToLower().Contains(s) ||
                    Has(K.JOJWI_SVOH_ServiceOrderNo, s) ||
                    Has(K.JWV_JW_VendorName, s));
            }

            switch (SortOrder)
            {
                case "Title_desc": q = q.OrderByDescending(x => x.JOJWI_SVOH_ServiceOrderDate); break;
                case "Title": q = q.OrderBy(x => x.JOJWI_SVOH_ServiceOrderDate); break;
                default: q = q.OrderByDescending(x => x.JOJWI_SVOH_Number); break;
            }

            var result = q.ToList();

            RegisterPaging(result.Count, PageNumber, PSize, PageFilter, SortOrder, Search, out pageNo, out pageSize);

            ViewBag.SumOfItem = Convert.ToInt32(RegisterTotal(ds, "TotalItems"));
            ViewBag.SumOfQty = RegisterTotal(ds, "TotalQty");
            ViewBag.SumOfAmount = RegisterTotal(ds, "TotalAmount");

            return result;
        }
        #endregion JWI Summary

        #region JWI Detailed
        [HttpGet]
        [Route("joboutward/transactions/jo-service-order/jwi-detailed")]
        public IActionResult JOJWI_ServiceOrderDetailed(string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter)
        {
            var list = JOJWI_DetailedData(SortOrder, Search, PageNumber, PSize, PageFilter, out int pageNo, out int pageSize);
            return View(RegisterViewPath + "JWI_RegisterDetail.cshtml",
                PaginatedList_DTO<JOJWI_ServiceOrderDetailed_DTO>.CreateAsync(list, pageNo, pageSize));
        }

        [HttpPost]
        [Route("joboutward/transactions/jo-service-order/jwi-detailed")]
        public IActionResult JOJWI_ServiceOrderDetailed(string? SortOrder, string? Search, int? PageNumber, int PSize,
            string? PageFilter, string? Mode, string? SO_No, string[] DeleteNumber)
        {
            var redirect = RegisterRedirect(Mode, SO_No, DeleteNumber, "JWI");
            if (redirect != null) return redirect;

            var list = JOJWI_DetailedData(SortOrder, Search, PageNumber, PSize, PageFilter, out int pageNo, out int pageSize);
            return View(RegisterViewPath + "JWI_RegisterDetail.cshtml",
                PaginatedList_DTO<JOJWI_ServiceOrderDetailed_DTO>.CreateAsync(list, pageNo, pageSize));
        }

        private List<JOJWI_ServiceOrderDetailed_DTO> JOJWI_DetailedData(string? SortOrder, string? Search, int? PageNumber,
            int PSize, string? PageFilter, out int pageNo, out int pageSize)
        {
            var dto = new JOJWI_ServiceOrderSummary_DTO { SO_Id = 2, SO_CreatorCode = 1 };
            DataSet ds = JO_DAO.JOJWI_ServiceOrderSummaryDB(dto);
            var list = JO_DL.JOJWI_DetailedList(ds.Tables[0]);

            if (string.IsNullOrEmpty(SortOrder)) SortOrder = "Title_desc";

            IEnumerable<JOJWI_ServiceOrderDetailed_DTO> q = list;

            if (!string.IsNullOrEmpty(Search))
            {
                string s = Search.ToLower();
                q = q.Where(K =>
                    K.JOJWI_SVOH_ServiceOrderDate.ToString("dd-MMM-yyyy").ToLower().Contains(s) ||
                    Has(K.JOJWI_SVOH_ServiceOrderNo, s) ||
                    Has(K.JWV_JW_VendorName, s) ||
                    Has(K.CurrencyCode, s) ||
                    Has(K.ItemCode, s));
            }

            switch (SortOrder)
            {
                case "Title_desc": q = q.OrderByDescending(x => x.JOJWI_SVOH_ServiceOrderDate); break;
                case "Title": q = q.OrderBy(x => x.JOJWI_SVOH_ServiceOrderDate); break;
                default: q = q.OrderByDescending(x => x.JOJWI_SVOH_Number); break;
            }

            var result = q.ToList();

            RegisterPaging(result.Count, PageNumber, PSize, PageFilter, SortOrder, Search, out pageNo, out pageSize);

            ViewBag.SumOfQty = RegisterTotal(ds, "TotalQty");
            ViewBag.SumOfUnitPrice = RegisterTotal(ds, "TotalUnitPrice");
            ViewBag.SumOfAmount = RegisterTotal(ds, "TotalAmount");

            return result;
        }
        #endregion JWI Detailed

        #region Freight Summary
        [HttpGet]
        [Route("joboutward/transactions/jo-service-order/freight-summary")]
        public IActionResult JOFRT_ServiceOrderSummary(string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter)
        {
            var list = JOFRT_SummaryData(SortOrder, Search, PageNumber, PSize, PageFilter, out int pageNo, out int pageSize);
            return View(RegisterViewPath + "Freight_RegisterSummary.cshtml",
                PaginatedList_DTO<JOFRT_ServiceOrderSummary_DTO>.CreateAsync(list, pageNo, pageSize));
        }

        [HttpPost]
        [Route("joboutward/transactions/jo-service-order/freight-summary")]
        public IActionResult JOFRT_ServiceOrderSummary(string? SortOrder, string? Search, int? PageNumber, int PSize,
            string? PageFilter, string? Mode, string? SI_No, string[] DeleteNumber)
        {
            var redirect = RegisterRedirect(Mode, SI_No, DeleteNumber, "FREIGHT");
            if (redirect != null) return redirect;

            var list = JOFRT_SummaryData(SortOrder, Search, PageNumber, PSize, PageFilter, out int pageNo, out int pageSize);
            return View(RegisterViewPath + "Freight_RegisterSummary.cshtml",
                PaginatedList_DTO<JOFRT_ServiceOrderSummary_DTO>.CreateAsync(list, pageNo, pageSize));
        }

        private List<JOFRT_ServiceOrderSummary_DTO> JOFRT_SummaryData(string? SortOrder, string? Search, int? PageNumber,
            int PSize, string? PageFilter, out int pageNo, out int pageSize)
        {
            var dto = new JOFRT_ServiceOrderSummary_DTO { SO_Id = 1, SO_CreatorCode = 1 };
            DataSet ds = JO_DAO.JOFRT_ServiceOrderSummaryDB(dto);
            var list = JO_DL.JOFRT_SummaryList(ds.Tables[0]);

            if (string.IsNullOrEmpty(SortOrder)) SortOrder = "Title_desc";

            IEnumerable<JOFRT_ServiceOrderSummary_DTO> q = list;

            if (!string.IsNullOrEmpty(Search))
            {
                string s = Search.ToLower();
                q = q.Where(K =>
                    K.JOFRT_SVOH_ServiceOrderDate.ToString("dd-MMM-yyyy").ToLower().Contains(s) ||
                    Has(K.JOFRT_SVOH_ServiceOrderNo, s) ||
                    Has(K.JWV_JW_VendorName, s));
            }

            switch (SortOrder)
            {
                case "Title_desc": q = q.OrderByDescending(x => x.JOFRT_SVOH_ServiceOrderDate); break;
                case "Title": q = q.OrderBy(x => x.JOFRT_SVOH_ServiceOrderDate); break;
                default: q = q.OrderByDescending(x => x.JOFRT_SVOH_Number); break;
            }

            var result = q.ToList();

            RegisterPaging(result.Count, PageNumber, PSize, PageFilter, SortOrder, Search, out pageNo, out pageSize);

            ViewBag.SumOfItem = Convert.ToInt32(RegisterTotal(ds, "TotalItems"));
            ViewBag.SumOfQty = RegisterTotal(ds, "TotalQty");
            ViewBag.SumOfAmount = RegisterTotal(ds, "TotalAmount");

            return result;
        }
        #endregion Freight Summary

        #region Freight Detailed
        [HttpGet]
        [Route("joboutward/transactions/jo-service-order/freight-detailed")]
        public IActionResult JOFRT_ServiceOrderDetailed(string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter)
        {
            var list = JOFRT_DetailedData(SortOrder, Search, PageNumber, PSize, PageFilter, out int pageNo, out int pageSize);
            return View(RegisterViewPath + "Freight_RegisterDetail.cshtml",
                PaginatedList_DTO<JOFRT_ServiceOrderDetailed_DTO>.CreateAsync(list, pageNo, pageSize));
        }

        [HttpPost]
        [Route("joboutward/transactions/jo-service-order/freight-detailed")]
        public IActionResult JOFRT_ServiceOrderDetailed(string? SortOrder, string? Search, int? PageNumber, int PSize,
            string? PageFilter, string? Mode, string? SO_No, string[] DeleteNumber)
        {
            var redirect = RegisterRedirect(Mode, SO_No, DeleteNumber, "FREIGHT");
            if (redirect != null) return redirect;

            var list = JOFRT_DetailedData(SortOrder, Search, PageNumber, PSize, PageFilter, out int pageNo, out int pageSize);
            return View(RegisterViewPath + "Freight_RegisterDetail.cshtml",
                PaginatedList_DTO<JOFRT_ServiceOrderDetailed_DTO>.CreateAsync(list, pageNo, pageSize));
        }

        private List<JOFRT_ServiceOrderDetailed_DTO> JOFRT_DetailedData(string? SortOrder, string? Search, int? PageNumber,
            int PSize, string? PageFilter, out int pageNo, out int pageSize)
        {
            var dto = new JOFRT_ServiceOrderSummary_DTO { SO_Id = 2, SO_CreatorCode = 1 };
            DataSet ds = JO_DAO.JOFRT_ServiceOrderSummaryDB(dto);
            var list = JO_DL.JOFRT_DetailedList(ds.Tables[0]);

            if (string.IsNullOrEmpty(SortOrder)) SortOrder = "Title_desc";

            IEnumerable<JOFRT_ServiceOrderDetailed_DTO> q = list;

            if (!string.IsNullOrEmpty(Search))
            {
                string s = Search.ToLower();
                q = q.Where(K =>
                    K.JOFRT_SVOH_ServiceOrderDate.ToString("dd-MMM-yyyy").ToLower().Contains(s) ||
                    Has(K.JOFRT_SVOH_ServiceOrderNo, s) ||
                    Has(K.JWV_JW_VendorName, s) ||
                    Has(K.CurrencyCode, s));
            }

            switch (SortOrder)
            {
                case "Title_desc": q = q.OrderByDescending(x => x.JOFRT_SVOH_ServiceOrderDate); break;
                case "Title": q = q.OrderBy(x => x.JOFRT_SVOH_ServiceOrderDate); break;
                default: q = q.OrderByDescending(x => x.JOFRT_SVOH_Number); break;
            }

            var result = q.ToList();

            RegisterPaging(result.Count, PageNumber, PSize, PageFilter, SortOrder, Search, out pageNo, out pageSize);

            ViewBag.SumOfQty = RegisterTotal(ds, "TotalQty");
            ViewBag.SumOfRate = RegisterTotal(ds, "TotalRate");
            ViewBag.SumOfAmount = RegisterTotal(ds, "TotalAmount");

            return result;
        }
        #endregion Freight Detailed

        #endregion register

        #region pages

        public IActionResult Create()
        {
            GetJOServiceOrderData();
            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JO_ServiceOrder/Create.cshtml");
        }

        public IActionResult Edit(long SI_No, string OrderType)
        {
            GetJOServiceOrderData();
            ViewBag.Collapse = true;
            ViewBag.SI_No = SI_No;
            ViewBag.OrderType = OrderType;
            return View("~/Views/JobworkOutward/JO_ServiceOrder/Edit.cshtml");
        }

        // read-only view of a saved order (Edit page in view mode)
        public IActionResult ViewOrder(long SI_No, string OrderType)
        {
            GetJOServiceOrderData();
            ViewBag.Collapse = true;
            ViewBag.SI_No = SI_No;
            ViewBag.OrderType = OrderType;
            ViewBag.IsViewMode = true;
            return View("~/Views/JobworkOutward/JO_ServiceOrder/Edit.cshtml");
        }

        #endregion
    }
}
