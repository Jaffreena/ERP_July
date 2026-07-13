using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Wordprocessing;
using ERP.DataList;
using ERP.Models;
using ERP_DAO;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobInwardTransaction;
using Humanizer;
using Microsoft.AspNetCore.Mvc;
using SelectPdf;
using System.Data;
using System.Text.Json;
using System.Transactions;



namespace ERP.Controllers
{
    public class ConversionController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();
        Validation Valid = new Validation();

        //summary test
        Int32? DPageNumber;
        Int32 DPageSize;
        //summary test
        Int32? CPageNumber;
        Int32 CPageSize;
        List<DeliveryNoteSummary_DTO> DNS_List = new List<DeliveryNoteSummary_DTO>();
        List<DeliveryNoteDetailed_DTO> DND_List = new List<DeliveryNoteDetailed_DTO>();
        List<ConversionDetailed_DTO> Conversion_List = new List<ConversionDetailed_DTO>();
        List<ConversionSummary_DTO> Conversion_List_summary = new List<ConversionSummary_DTO>();
        
        DeliveryNoteSummary_DTO DNS_DTO = new DeliveryNoteSummary_DTO();
        DeliveryNote_DAO DN_DAO = new DeliveryNote_DAO();
       DeliveryNote_DL DN_DL = new DeliveryNote_DL();
        Conversion_DL Conversion_DL = new Conversion_DL();
        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;
    
        [Route("jobinward/transactions/delivery-note/buyer/address")]
        public IActionResult SaleBuyerAddressID(String? Buyer, String ADTPNumber)
        {
            SaleInvoice_DL S_DL = new SaleInvoice_DL();
            DataSet DS = new DataSet();
            DeliveryNoteCreate_DTO DN_DTO = new DeliveryNoteCreate_DTO();
            DeliveryNote_DAO DN_DAO = new DeliveryNote_DAO();
            if (Buyer == null)
            {
                Buyer = "";
            }
           
            DN_DTO.Header.DN_CUS_Number = Convert.ToInt32(Buyer);
            DN_DTO.Header.DN_ADD_ADTP_Number = Convert.ToInt32(ADTPNumber);
            DN_DTO.Header.DN_Id = 13;
            DS = DN_DAO.DeliveryNoteDB(DN_DTO);
             
            SaleInvoiceAddress SIA = new SaleInvoiceAddress();
            SIA.BuyerAddressId = S_DL.JWCCustAddressID(DS.Tables[0]);
            SIA.BuyerAddress = S_DL.JWCCustAddress(DS.Tables[1]).FirstOrDefault();
            return Json(SIA);
        }
        [Route("jobinward/transactions/conversion/item")]
        public IActionResult SaleItem(String? ItemCode, String MS)
        {
            ReceiptNote_DTO SI_DTO = new ReceiptNote_DTO();
            ReceiptNote_DAO SI_DAO = new ReceiptNote_DAO();
            ReceiptNote_DL S_DL = new ReceiptNote_DL();
            DataSet DS = new DataSet();
            if (ItemCode == null)
            {
                ItemCode = "";
            }
            if (MS == null)
            {
                MS = "";
            }
            SI_DTO.JIRN_CreatorCode = Convert.ToInt64(1);
            SI_DTO.JIRNI_ITM_Code = Convert.ToString(ItemCode);
            SI_DTO.JIRNH_MS_Number = Convert.ToInt64(MS);
            SI_DTO.JIRN_Id = 2;
            DS = SI_DAO.JI_ReceiptNoteDB(SI_DTO);
            var Item = S_DL.ItemList(DS.Tables[0]);
            return Json(Item);
        }

        [Route("jobinward/transactions/conversion/cutomer")]
        public IActionResult SaleBuyer(String? Buyer,   String? SIHDate)
        {
            ReceiptNote_DL S_DL = new ReceiptNote_DL();
            DeliveryNoteCreate_DTO DN_DTO = new DeliveryNoteCreate_DTO();
            DeliveryNote_DAO DN_DAO = new DeliveryNote_DAO();
            DataSet DS = new DataSet();

            if (Buyer == null)
            {
                Buyer = "";
            }
           
         
            DN_DTO.Header.JIDNI_Item_Code = Convert.ToString(Buyer);
            DN_DTO.Header.JIDNH_DN_Date = Convert.ToDateTime(SIHDate);
            DN_DTO.Header.DN_Id = 5;
            DS = DN_DAO.DeliveryNoteDB(DN_DTO);
            var Ven = S_DL.CustomerListData(DS.Tables[0]);
            return Json(Ven);
        }

        public DeliveryNoteCreate_DTO InsertDummyDeliveryNote()
        {

            DeliveryNoteCreate_DTO DN_   =new DeliveryNoteCreate_DTO();
            // ================================
            // 1. HEADER DUMMY DATA
            // ================================
            var header = new DeliveryNoteHeader_DTO
            {
                JIDNH_Number = 1,
                JIDNH_DN_No = "DN-0001",
                JIDNH_DN_Date = DateTime.Now,
                JIDNH_MS_Number = 100,
                JIDNH_JW_Customer_Number = 2001,
                JIDNH_Currency_Number = 1,
                JIDNH_WH_Number = 10,
                JIDNH_PaymentTerms = "30 Days",
                JIDNH_DeliveryTerms = "FOB",
                JIDNH_DeliveryMode = "Road",
                JIDNH_DespatchDocumentNo = "DOC-7788",
                JIDNH_DespatchedThrough = "Transport Pvt Ltd",
                JIDNH_Remarks = "Dummy insert for testing"
            };


            // ================================
            // 2. ITEM DUMMY DATA (MULTIPLE ROWS)
            // ================================
            var items = new List<DeliveryNoteItem_DTO>
    {
        new DeliveryNoteItem_DTO
        {
            JIDNI_JIDNH_Number = 1,
            JIDNI_Number = 1,
            JIDNI_PRS_Number = 501,
            JIDNI_Item_Number = 1001,
            JIDNI_WH_Number = 10,
            JIDNI_UoM_Number = 1,
            JIDNI_Qty = 5,
            JIDNI_UnitPrice = 100,
            JIDNI_Amount = 500,
            JIDNI_JW_InvoiceTracking = "Y"
        },

        new DeliveryNoteItem_DTO
        {
            JIDNI_JIDNH_Number = 1,
            JIDNI_Number = 2,
            JIDNI_PRS_Number = 502,
            JIDNI_Item_Number = 1002,
            JIDNI_WH_Number = 10,
            JIDNI_UoM_Number = 1,
            JIDNI_Qty = 2,
            JIDNI_UnitPrice = 250,
            JIDNI_Amount = 500,
            JIDNI_JW_InvoiceTracking = "N"
        }
    };


            // ================================
            // 3. ADDRESS DUMMY DATA
            // ================================
            var addresses = new List<DeliveryNoteAddress_DTO>
    {
        new DeliveryNoteAddress_DTO
        {
            JIDNA_JIDNH_Number = 1,
            JIDNA_Number = 1,
            JIDNA_ADTP_Number = 1,
            JIDNA_Address_ID = "ADDR-001",
            JIDNA_Address = "No 12, Main Street, Kattur",
            JIDNA_City = "Trichy",
            JIDNA_State = "Tamil Nadu",
            JIDNA_Country = "India",
            JIDNA_PIN = "620019",
            JIDNA_GSTIN = "33ABCDE1234F1Z5"
        }
    };
            DN_.Header= header;
            DN_.Items= items;
            DN_.Addresses= addresses;
            return DN_;



        }


        #region Delivery Note Create
        public IActionResult Index()
        {
            ConversionCreate_DTO DN_DTO = new ConversionCreate_DTO();
            GetDevliverNoteData();
            DeliveryNote_DAO DN_DAO = new DeliveryNote_DAO();
            DN_DAO.DeleteTempDeliveryNoteBatch();
            ViewBag.Collapse = true;
            return View(DN_DTO);
        }

        public void GetDevliverNoteData()
        {
            ConversionCreate_DTO DN_DTO = new ConversionCreate_DTO();
            Conversion_DAO DN_DAO = new Conversion_DAO();
            DN_DTO.Header.JIDNH_DN_Date = DateTime.Now;
            DN_DTO.Header.DN_Id = 1;
            DataSet DS = new DataSet();
            DS = DN_DAO.ConversionDB(DN_DTO);
            ViewBag.Currency = Help.GetCat(DS.Tables[4]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[5]);
            ViewBag.UoM = Help.GetCat(DS.Tables[6]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[8]);
            ViewBag.AddressType = Help.GetCat(DS.Tables[12]);
            ViewBag.Process = Help.GetCat(DS.Tables[13]);
            ViewBag.SON = Help.GetCat(DS.Tables[14]);
            ViewBag.Shift = Help.GetCat(DS.Tables[15]);
            ViewBag.WorkCentre = Help.GetCat(DS.Tables[16]);
        }
        [HttpPost]
        public IActionResult SaveDeliveryNote([FromBody] ConversionCreate_DTO dto)
        {
           
            try
            {
                if (dto == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "DTO is null"
                    });
                }

                if (dto.Header == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Header is null"
                    });
                }

                Conversion_DAO DN_DAO = new Conversion_DAO();

                dto.Header.DN_Id = 10;
                dto.Header.JIDNH_DN_Date = DateTime.Now;
                dto.Header.JIDNI_Item_Code = "1";

                DataSet ds = DN_DAO.ConversionCreateDB(dto);

                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action("Index", "DeliveryNote")
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


        #endregion


        #region Conversion Summary

        [Route("job-inward/transactions/conversion-summary")]
        public IActionResult ConversionSummary(
            string? SortOrder,
            string? Search,
            int? PageNumber,
            int PSize,
            string? PageFilter)
        {
            Conversion_List_summary = ConversionSummaryGetData(
                SortOrder,
                Search,
                PageNumber,
                PSize,
                PageFilter);
            ViewBag.Collapse = true;
            return View(
                PaginatedList_DTO<ConversionSummary_DTO>
                .CreateAsync(Conversion_List_summary, CPageNumber ?? 1, CPageSize));
        }
        [Route("job-inward/transactions/conversion-summary")]
        [HttpPost]
        public IActionResult ConversionSummary(
    string? SortOrder,
    string? Search,
    int? PageNumber,
    int PSize,
    string? PageFilter,
    string? Mode,
    string? JICNVH_Number)
        {
            ConversionSummary_DTO dto = new ConversionSummary_DTO();

            if (Mode == "Delete")
            {
                dto.JICNVH_Number = Convert.ToInt64(JICNVH_Number);
                return RedirectToAction("ConversionSummary");
            }

            if (Mode == "View")
            {
                return RedirectToAction("View", new { JICNVH_Number });
            }

            if (Mode == "Edit")
            {
                return RedirectToAction("Edit", new { JICNVH_Number });
            }

            Conversion_List_summary = ConversionSummaryGetData(
                SortOrder,
                Search,
                PageNumber,
                PSize,
                PageFilter);

            return View(
                PaginatedList_DTO<ConversionSummary_DTO>
                .CreateAsync(Conversion_List_summary, CPageNumber ?? 1, CPageSize));
        }
        List<ConversionSummary_DTO> ConversionSummaryGetData(
    string? SortOrder,
    string? Search,
    int? PageNumber,
    int PSize,
    string? PageFilter)
        {
            CPageSize = 10;

            Conversion_DAO obj = new Conversion_DAO();

            // 🔥 CHANGE HERE: call summary SP
            DS = obj.ConversionSummaryDB();

            Conversion_List_summary =
                Conversion_DL.ConversionSummaryList(DS.Tables[0]);

            if (string.IsNullOrEmpty(SortOrder))
                SortOrder = "Default";

            if (Convert.ToInt32(PageNumber) == 0)
                CPageNumber = 1;

            if (PageFilter?.ToLower() == "pagefilter")
                CPageNumber = 1;

            ViewData["CurrentSort"] = SortOrder;
            ViewData["CurrentFilter"] = Search;

            IEnumerable<ConversionSummary_DTO> Key = Conversion_List_summary;

            if (!string.IsNullOrEmpty(Search))
            {
                Key = Key.Where(x =>
                    (x.JICNVH_ConvJournalNo ?? "").ToLower().Contains(Search.ToLower()) ||
                    (x.SFT_ShiftName ?? "").ToLower().Contains(Search.ToLower()) ||
                    (x.WC_WorkCentre ?? "").ToLower().Contains(Search.ToLower()) ||
                    (x.PRS_ProcessName ?? "").ToLower().Contains(Search.ToLower())
                );
            }

            switch (SortOrder)
            {
                case "Title":
                    Key = Key.OrderBy(x => x.JICNVH_Date)
                             .ThenBy(x => x.JICNVH_Number);
                    break;

                case "Title_desc":
                    Key = Key.OrderByDescending(x => x.JICNVH_Date)
                             .ThenByDescending(x => x.JICNVH_Number);
                    break;
            }

            if (PSize != 0)
                CPageSize = PSize;

            int Record = Key.Count();

            if (PageNumber > 1)
            {
                int RecordPage = (Convert.ToInt32(PageNumber) - 1) * CPageSize;

                if (Record > RecordPage)
                    CPageNumber = Convert.ToInt32(PageNumber);
                else
                {
                    double Page = Convert.ToDouble(Record) / CPageSize;
                    int PageCount = Convert.ToInt32(Math.Ceiling(Page));

                    CPageNumber =
                        PageNumber > PageCount
                        ? PageCount
                        : Convert.ToInt32(PageNumber);
                }
            }
            else
            {
                CPageNumber =
                    Convert.ToInt32(PageNumber) == 0
                    ? 1
                    : Convert.ToInt32(PageNumber);
            }

            double Pages = Convert.ToDouble(Record) / CPageSize;
            int PageCounts = Convert.ToInt32(Math.Ceiling(Pages));

            ViewBag.Page = Help.PageSize(PSize.ToString());

            ViewData["PageNumber"] = CPageNumber;
            ViewData["PageSize"] = CPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Record;

            return Key.ToList();
        }
        #endregion

        #region Conversion detailed

        [Route("job-inward/transactions/conversion-detailed")]
        public IActionResult ConversionDetailed(
            string? SortOrder,
            string? Search,
            int? PageNumber,
            int PSize,
            string? PageFilter)
        {
            Conversion_List = ConversionDetailedGetData(
                SortOrder,
                Search,
                PageNumber,
                PSize,
                PageFilter);
            ViewBag.Collapse = true;
            return View(
                PaginatedList_DTO<ConversionDetailed_DTO>
                .CreateAsync(Conversion_List, CPageNumber ?? 1, CPageSize));
        }

        [Route("job-inward/transactions/conversion-summary")]
        [HttpPost]
        public IActionResult ConversionDetailed(
            string? SortOrder,
            string? Search,
            int? PageNumber,
            int PSize,
            string? PageFilter,
            string? Mode,
            string? JICNVH_Number)
        {
            ConversionDetailed_DTO dto = new ConversionDetailed_DTO();

            if (Mode == "Delete")
            {
                dto.JICNVH_Number = Convert.ToInt64(JICNVH_Number);

                // Set your delete mode if required
                // dto.Mode = 104;

                // DAO Delete
                // DS = Conversion_DAO.ConversionSummaryDB(dto);

                return RedirectToAction("ConversionDetailed");
            }

            if (Mode == "View")
            {
                return RedirectToAction("View", new
                {
                    JICNVH_Number
                });
            }

            if (Mode == "Edit")
            {
                return RedirectToAction("Edit", new
                {
                    JICNVH_Number
                });
            }

            Conversion_List = ConversionDetailedGetData(
                SortOrder,
                Search,
                PageNumber,
                PSize,
                PageFilter);

            return View(
                PaginatedList_DTO<ConversionDetailed_DTO>
                .CreateAsync(Conversion_List, CPageNumber ?? 1, CPageSize));
        }

        List<ConversionDetailed_DTO> ConversionDetailedGetData(
       string? SortOrder,
       string? Search,
       int? PageNumber,
       int PSize,
       string? PageFilter)
        {
            CPageSize = 10;

            Conversion_DAO obj = new Conversion_DAO();
            DS = obj.ConversionDetailedDB();

            Conversion_List =
                Conversion_DL.ConversionDetailedList(DS.Tables[0]);

            if (string.IsNullOrEmpty(SortOrder))
                SortOrder = "Default";

            if (Convert.ToInt32(PageNumber) == 0)
                CPageNumber = 1;

            if (PageFilter?.ToLower() == "pagefilter")
                CPageNumber = 1;

            ViewData["CurrentSort"] = SortOrder;
            ViewData["CurrentFilter"] = Search;

            IEnumerable<ConversionDetailed_DTO> Key = Conversion_List;

            if (!string.IsNullOrEmpty(Search))
            {
                Key = Key.Where(x =>

                    (x.JICNVH_ConvJournalNo ?? "").ToLower().Contains(Search.ToLower()) ||

                    x.JICNVH_Date.ToString().Contains(Search) ||

                    (x.SFT_ShiftName ?? "").ToLower().Contains(Search.ToLower()) ||

                    (x.WC_WorkCentre ?? "").ToLower().Contains(Search.ToLower()) ||

                    (x.PRS_ProcessName ?? "").ToLower().Contains(Search.ToLower())

                );
            }

            switch (SortOrder)
            {
                case "Title":
                    Key = Key
                        .OrderBy(x => x.JICNVH_Date)
                        .ThenBy(x => x.JICNVH_Number);
                    break;

                case "Title_desc":
                    Key = Key
                        .OrderByDescending(x => x.JICNVH_Date)
                        .ThenByDescending(x => x.JICNVH_Number);
                    break;

                default:
                    // Keep the order returned by the stored procedure.
                    break;
            }

            if (PSize != 0)
                CPageSize = PSize;

            int Record = Key.Count();

            if (PageNumber > 1)
            {
                int RecordPage = (Convert.ToInt32(PageNumber) - 1) * CPageSize;

                if (Record > RecordPage)
                {
                    CPageNumber = Convert.ToInt32(PageNumber);
                }
                else
                {
                    double Page = Convert.ToDouble(Record) / CPageSize;
                    int PageCount = Convert.ToInt32(Math.Ceiling(Page));

                    CPageNumber =
                        PageNumber > PageCount
                        ? PageCount
                        : Convert.ToInt32(PageNumber);
                }
            }
            else
            {
                CPageNumber =
                    Convert.ToInt32(PageNumber) == 0
                    ? 1
                    : Convert.ToInt32(PageNumber);
            }

            double Pages = Convert.ToDouble(Record) / CPageSize;

            int PageCounts = Convert.ToInt32(Math.Ceiling(Pages));

            ViewBag.Page = Help.PageSize(PSize.ToString());

            ViewData["PageNumber"] = CPageNumber;
            ViewData["PageSize"] = CPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Record;

            return Key.ToList();
        }

        #endregion

        #region delivery note view
        public ActionResult DeliveryNoteView(long JIDNH_Number)
        {
            List<DeliveryNoteCreate_DTO> DN_List =
                DeliveryNoteViewGetData(JIDNH_Number);

            DeliveryNoteCreate_DTO DN_DTO =
                new DeliveryNoteCreate_DTO();

          
            if (DN_List.Count > 0)
            {
                DN_DTO = DN_List.FirstOrDefault();
            }

         
            return View(DN_DTO);
        }
        public List<DeliveryNoteCreate_DTO> DeliveryNoteViewGetData(long JIDNH_Number)
        {
            List<DeliveryNoteCreate_DTO> DN_List =   new List<DeliveryNoteCreate_DTO>();

            DeliveryNote_DAO DN_DAO =  new DeliveryNote_DAO();

            DeliveryNote_DL DN_DL =   new DeliveryNote_DL();

            DataSet DS = new DataSet();

            //-----------------------------------------
            // GET DATA
            //-----------------------------------------
            DS = DN_DAO.DeliveryNoteViewDB(JIDNH_Number);

            //-----------------------------------------
            // CONVERT DATASET TO DTO LIST
            //-----------------------------------------
            DN_List =  DN_DL.DeliveryNoteViewList(DS);

            return DN_List;
        }
        #endregion

        #region delivery note edit

        public IActionResult Edit(long JIDNH_Number)
        {
            DeliveryNoteCreate_DTO dto =
                new DeliveryNoteCreate_DTO();

            DeliveryNote_DAO DN_DAO =
                new DeliveryNote_DAO();

           
            GetDevliverNoteData();

            
            DataSet DS = DN_DAO.DeliveryNoteEditDB(JIDNH_Number);

            long Root_JIDNI_Number = 0;
            if (DS.Tables[0].Rows.Count > 0)
            {
                DataRow dr = DS.Tables[0].Rows[0];

                dto.Header.JIDNH_Number =
                    Convert.ToInt64(dr["JIDNH_Number"]);

                dto.Header.JIDNH_DN_No =
                    Convert.ToString(dr["JIDNH_DN_No"]);

                dto.Header.JIDNH_DN_Date =
                    Convert.ToDateTime(dr["JIDNH_DN_Date"]);

                dto.Header.JIDNH_MS_Number =
                    Convert.ToInt32(dr["JIDNH_MS_Number"]);

                dto.Header.JIDNH_JW_Customer_Number =
                    Convert.ToInt64(dr["JIDNH_JW_Customer_Number"]);

                dto.Header.JIDNH_JW_Customer_Name =
                    Convert.ToString(dr["JIDNH_JW_Customer_Name"]);

                dto.Header.JIDNH_Currency_Number =
                    Convert.ToInt32(dr["JIDNH_Currency_Number"]);

                dto.Header.JIDNH_WH_Number =
                    Convert.ToInt32(dr["JIDNH_WH_Number"]);

                dto.Header.JIDNH_PaymentTerms =
                    Convert.ToString(dr["JIDNH_PaymentTerms"]);

                dto.Header.JIDNH_DeliveryTerms =
                    Convert.ToString(dr["JIDNH_DeliveryTerms"]);

                dto.Header.JIDNH_DeliveryMode =
                    Convert.ToString(dr["JIDNH_DeliveryMode"]);

                dto.Header.JIDNH_DespatchDocumentNo =
                    Convert.ToString(dr["JIDNH_DespatchDocumentNo"]);

                dto.Header.JIDNH_DespatchedThrough =
                    Convert.ToString(dr["JIDNH_DespatchedThrough"]);

                dto.Header.JIDNH_Remarks =
                    Convert.ToString(dr["JIDNH_Remarks"]);
            }

            // ITEMS
            dto.Items = new List<DeliveryNoteItem_DTO>();

            foreach (DataRow item in DS.Tables[1].Rows)
            {
                long currentJIDNI_Number =
       Convert.ToInt64(item["JIDNI_Number"]);

                // fill only first time
                if (Root_JIDNI_Number == 0)
                {
                    Root_JIDNI_Number = currentJIDNI_Number;
                }
                dto.Items.Add(new DeliveryNoteItem_DTO
                {

                    JIDNI_Number =
                        Convert.ToInt64(item["JIDNI_Number"]),

                    JIDNI_PRS_Number =
                        Convert.ToInt32(item["JIDNI_PRS_Number"]),

                    JIDNI_Item_Number =
                        Convert.ToInt64(item["JIDNI_Item_Number"]),

                    JIDNI_Item_Code =
                        Convert.ToString(item["JIDNI_Item_Code"]),

                    JIDNI_Item_Description =
                        Convert.ToString(item["JIDNI_Item_Description"]),

                    JIDNI_OuterDia =
                        Convert.ToString(item["JIDNI_OuterDia"]),

                    JIDNI_Thickness =
                        Convert.ToString(item["JIDNI_Thickness"]),

                    JIDNI_Length =
                        Convert.ToString(item["JIDNI_Length"]),

                    JIDNI_Width =
                        Convert.ToString(item["JIDNI_Width"]),

                    JIDNI_MaterialGrade =
                        Convert.ToString(item["JIDNI_MaterialGrade"]),

                    JIDNI_ItemGroup =
                        Convert.ToString(item["JIDNI_ItemGroup"]),

                    JIDNI_WH_Number =
                        Convert.ToInt32(item["JIDNI_WH_Number"]),

                    JIDNI_UoM_Number =
                        Convert.ToInt32(item["JIDNI_UoM_Number"]),

                    JIDNI_Qty =
                        Convert.ToDouble(item["JIDNI_Qty"]),

                    JIDNI_UnitPrice =
                        Convert.ToDouble(item["JIDNI_UnitPrice"]),

                    JIDNI_Amount =
                        Convert.ToDouble(item["JIDNI_Amount"]),

                    JIDNI_JW_InvoiceTracking =
                        Convert.ToString(item["JIDNI_JW_InvoiceTracking"]) ,
                    JISVOH_Number =
                        Convert.ToInt64(item["JISVOH_Number"])
                });
            }

            // ADDRESS
            dto.Addresses = new List<DeliveryNoteAddress_DTO>();

            foreach (DataRow add in DS.Tables[2].Rows)
            {
                dto.Addresses.Add(new DeliveryNoteAddress_DTO
                {
                    JIDNA_Address =
                        Convert.ToString(add["JIDNA_Address"])
                });
            }
            DeliveryNote_DAO dao = new DeliveryNote_DAO();

            dao.InsertEditBatchToTempDB(Root_JIDNI_Number);
       
            ViewBag.Collapse = true;
            var x = dto.Items[0].JISVOH_Number;
            return View("Edit", dto);
        }
        #endregion

        #region Show Batch
        [HttpGet]
        public JsonResult GetBatchDetails(long FromWarehouse, long LineItem_Number,int ItemGridIndex)
        {
            DeliveryNote_DAO dao = new DeliveryNote_DAO();
            DataTable dt = dao.GetBatchDetailsDB(FromWarehouse, LineItem_Number, ItemGridIndex).Tables[0];
            var data = dt.AsEnumerable().Select(r => new
            {
                LineBatch_Number = r["LineBatch_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["LineBatch_Number"]),
                FromWarehouse = r["FromWarehouse"] == DBNull.Value ? 0 : Convert.ToInt64(r["FromWarehouse"]),

                BatchDate = r["BatchDate"] == DBNull.Value
                    ? ""
                    : Convert.ToDateTime(r["BatchDate"]).ToString("dd MMM yyyy"),

                BatchNo = r["BatchNo"] == DBNull.Value ? "" : r["BatchNo"].ToString(),

                BatchQty = r["BatchQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchQty"]),
                ReservedQty = r["ReservedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["ReservedQty"]),
                DeliveredQty = r["DeliveredQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["DeliveredQty"]),
                AvailableQty = r["AvailableQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["AvailableQty"]),

                BatchUnitPrice = r["BatchUnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchUnitPrice"]),
                BatchValue = r["BatchValue"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchValue"]),

                WareHouseCode =
                    dt.Columns.Contains("WarehouseCode") && r["WarehouseCode"] != DBNull.Value
                    ? r["WarehouseCode"].ToString()
                    : ""
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }
        #endregion

        #region Show Batch Edit

        [HttpGet]
        public JsonResult GetBatchDetailsEdit(long FromWarehouse, long LineItem_Number,long JIDNI_Number,int ItemGridIndex,long JIDNH_Number)
        {
           

            DeliveryNote_DAO dao = new DeliveryNote_DAO();
           bool isTempEmpty = dao.IsTempDeliveryBatchEmpty();
            DataTable dt = new DataTable();
          dt=  dao.GetBatchStockDetails(LineItem_Number, FromWarehouse, JIDNH_Number, JIDNI_Number, ItemGridIndex);
            


            var data = dt.AsEnumerable().Select(r => new
            {
                LineBatch_Number = r["LineBatch_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["LineBatch_Number"]),
                FromWarehouse = r["FromWarehouse"] == DBNull.Value ? 0 : Convert.ToInt64(r["FromWarehouse"]),

                BatchDate = r["BatchDate"] == DBNull.Value
                    ? ""
                    : Convert.ToDateTime(r["BatchDate"]).ToString("dd MMM yyyy"),

                BatchNo = r["BatchNo"] == DBNull.Value ? "" : r["BatchNo"].ToString(),

                BatchQty = r["BatchQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchQty"]),
                ReservedQty = r["ReservedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["ReservedQty"]),
                DeliveredQty = r["DeliveredQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["DeliveredQty"]),
                AvailableQty = r["AvailableQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["AvailableQty"]),

                BatchUnitPrice = r["BatchUnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchUnitPrice"]),
                BatchValue = r["BatchValue"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchValue"]),
                RefBatch_Number = r["RefBatch_Number"] == DBNull.Value ? 0 : Convert.ToDecimal(r["RefBatch_Number"]),
                WareHouseCode =
                    dt.Columns.Contains("WarehouseCode") && r["WarehouseCode"] != DBNull.Value
                    ? r["WarehouseCode"].ToString()
                    : ""
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }
        #endregion

     
        #region Validate Batch Details

        [HttpGet]
        public JsonResult ValidateBatchDetails(long JIDNH_Number)
        {
            DeliveryNote_DAO dao = new DeliveryNote_DAO();

            string validationMessage =
                dao.ValidateBatchDetails(JIDNH_Number);

            var result = new
            {
                Status = string.IsNullOrEmpty(validationMessage),
                Message = validationMessage
            };

            return new JsonResult(result,
                new JsonSerializerOptions
                {
                    PropertyNamingPolicy =
                        JsonNamingPolicy.CamelCase,

                    WriteIndented = true
                });
        }

        #endregion

        #region Validate Amended Batch Qty

        [HttpGet]
        public JsonResult Validate_Amended_BatchQty(long JIDNH_Number)
        {
            DeliveryNote_DAO dao = new DeliveryNote_DAO();

            var data = dao.Validate_Amended_BatchQty(JIDNH_Number);

            var result = new
            {
                status = true,
                data = data
            };

            return new JsonResult(result, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }

        #endregion

        #region Show Batch View
        [HttpGet]
        public JsonResult GetBatchDetailsViewDB(long FromWarehouse, long LineItem_Number)
        {
            DeliveryNote_DAO dao = new DeliveryNote_DAO();
            DataTable dt = dao.GetBatchDetailsViewDB(FromWarehouse, LineItem_Number).Tables[0];
            var data = dt.AsEnumerable().Select(r => new
            {
              //  LineBatch_Number = r["LineBatch_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["LineBatch_Number"]),
             //   FromWarehouse = r["FromWarehouse"] == DBNull.Value ? 0 : Convert.ToInt64(r["FromWarehouse"]),

                BatchDate = r["BatchDate"] == DBNull.Value
                    ? ""
                    : Convert.ToDateTime(r["BatchDate"]).ToString("dd MMM yyyy"),

                BatchNo = r["BatchNo"] == DBNull.Value ? "" : r["BatchNo"].ToString(),

                BatchQty = r["BatchQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchQty"]),
                //ReceiptQty = r["ReceiptQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["ReservedQty"]),
                //DeliveredQty = r["DeliveredQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["DeliveredQty"]),
                //AvailableQty = r["AvailableQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["AvailableQty"]),

                BatchUnitPrice = r["BatchUnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchUnitPrice"]),
                BatchValue = r["BatchValue"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchValue"]),

                WareHouseCode =
                    dt.Columns.Contains("WarehouseCode") && r["WarehouseCode"] != DBNull.Value
                    ? r["WarehouseCode"].ToString()
                    : ""
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }
        #endregion

        #region Show Other Batch
        [HttpGet]
        public JsonResult GetOtherBatchDetails(long FromWarehouse, long LineItem_Number, int ItemGridIndex)
        {
            DeliveryNote_DAO dao = new DeliveryNote_DAO();
            DataTable dt = dao.GetOtherBatchDetailsDB(FromWarehouse, LineItem_Number, ItemGridIndex).Tables[0];
            var data = dt.AsEnumerable().Select(r => new
            {
                LineBatch_Number = r["LineBatch_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["LineBatch_Number"]),
                FromWarehouse = r["FromWarehouse"] == DBNull.Value ? 0 : Convert.ToInt64(r["FromWarehouse"]),

                BatchDate = r["BatchDate"] == DBNull.Value
                    ? ""
                    : Convert.ToDateTime(r["BatchDate"]).ToString("dd MMM yyyy"),

                BatchNo = r["BatchNo"] == DBNull.Value ? "" : r["BatchNo"].ToString(),

                BatchQty = r["BatchQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchQty"]),
                    AvailableQty = r["AvailableQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["AvailableQty"]),

                BatchUnitPrice = r["BatchUnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchUnitPrice"]),
                BatchValue = r["BatchValue"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchValue"]),

                WareHouseCode =
                    dt.Columns.Contains("WarehouseCode") && r["WarehouseCode"] != DBNull.Value
                    ? r["WarehouseCode"].ToString()
                    : ""
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }
        #endregion

        #region temp batch save (BULK)
        [HttpPost]
        public IActionResult SaveTempDeliveryBatch([FromBody] List<TempDeliveryBatch_DTO> dtoList)
        {
            try
            {
                if (dtoList == null || dtoList.Count == 0)
                {
                    return Json(new
                    {
                        success = false,
                        message = "DTO list is empty"
                    });
                }

                DeliveryNote_DAO DBCH_DAO = new DeliveryNote_DAO();
                

                    DBCH_DAO.TempDeliveryBatchSaveDB(dtoList);
                DBCH_DAO.UpdateTempBatchReservedQty();

                return Json(new
                {
                    success = true,
                    message = "Batch Saved Successfully",
                    count = dtoList.Count
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
        #endregion

        #region TEMP DELIVERY BATCH SAVE
        /*
            PURPOSE
            -------
            Save Temp Delivery Batch.

            ONLY 4 VALUES:
            --------------
            1. DBCH_Index
            2. DBCH_Item_Number
            3. DBCH_Warehouse_Number
            4. DBCH_DBCH_Number
        */

        [HttpPost]
        public IActionResult SaveTempDeliveryBatchAddRow
        (
            int DBCH_Index,
            long DBCH_Item_Number,
            long DBCH_Warehouse_Number,
            long DBCH_DBCH_Number
        )
        {
            try
            {
                DeliveryNote_DAO dao = new DeliveryNote_DAO();

                dao.InsertTempDeliveryBatch
                (
                    DBCH_Index,
                    DBCH_Item_Number,
                    DBCH_Warehouse_Number,
                    DBCH_DBCH_Number
                );

                return Json(new
                {
                    success = true,
                    message = "Saved Successfully"
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

        #endregion

        #region temp batch delete row
        [Route("Conversion/DeleteTempDeliveryBatchRow")]
        [HttpPost]
        public IActionResult DeleteTempDeliveryBatchRow(int index)
        {
            try
            {
                if (index <= 0)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Invalid index"
                    });
                }

                DeliveryNote_DAO dbch_DAO = new DeliveryNote_DAO();

                dbch_DAO.TempDeliveryBatchDeleteDBRow(index);

                return Json(new
                {
                    success = true,
                    message = "Row deleted successfully",
                    index = index
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
        #endregion


        #region temp batch delete row
        [Route("DeliveryNote/TempDeliveryBatchDeleteChangeItemDBRow")]
        [HttpPost]
        public IActionResult TempDeliveryBatchDeleteChangeItemDBRow(int index)
        {
            try
            {
                if (index <= 0)
                {
                    return Json(new
                    {
                        success = false,
                        message = "Invalid index"
                    });
                }

                DeliveryNote_DAO dbch_DAO = new DeliveryNote_DAO();

                dbch_DAO.TempDeliveryBatchDeleteChangeItemDBRow(index);

                return Json(new
                {
                    success = true,
                    message = "Row deleted successfully",
                    index = index
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
        #endregion

        #region temp batch update row
        [Route("DeliveryNote/TempDeliveryBatchEditChangeItemDBRow")]
        [HttpPost]
        public IActionResult TempDeliveryBatchEditChangeItemDBRow(int DBCH_Item_Number, int warehouse, int JINDI_Number, int JINDH_Number,int DBCH_Index)
        {
            try
            {
  

                DeliveryNote_DAO dbch_DAO = new DeliveryNote_DAO();

                dbch_DAO.TempDeliveryBatchEditChangeItemDBRow(DBCH_Item_Number, warehouse, JINDI_Number, JINDH_Number, DBCH_Index);
                dbch_DAO.UpdateTempBatchReservedQty();
                return Json(new
                {
                    success = true,
                    message = "Row deleted successfully",
                    index = 0
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
        #endregion
        #region update delivery note
        [HttpPost]
        public IActionResult UpdateDeliveryNote([FromBody] DeliveryNoteCreate_DTO dto)
        {

            try
            {
                Console.Write(dto);

                DeliveryNote_DAO DN_DAO = new DeliveryNote_DAO();
                DN_DAO.DeliveryNoteUpdateDB(dto);
                DN_DAO.DeleteTempDeliveryNoteBatch();
                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action("DeliveryNoteSummary", "DeliveryNote")
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

        #endregion

        #region delete item and batch
        [HttpPost]
        public IActionResult DeleteRemovedRows(
    [FromBody] List<DeletedRowInfo_DTO> deletedRows)
        {
            DeliveryNote_DAO DN_DAO = new DeliveryNote_DAO();

            DN_DAO.DeleteRemovedRowsDB(deletedRows);

            return Json(new { success = true });
        }
        #endregion
        #region Get Service Order
        [HttpGet]
        public JsonResult GetServiceOrder(long customerId, long? prsNumber = null, long? itemNumber = null, long? uomNumber = null)
        {
            var dt = new DeliveryNote_DAO()
                .GetServiceOrderDB(customerId, prsNumber, itemNumber, uomNumber)
                .Tables[0];

            return new JsonResult(
                dt.AsEnumerable().Select(r => new
                {
                    value = r["JISVOH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JISVOH_Number"]),
                    text = r["JISVOH_ServiceOrderNo"]?.ToString() ?? ""
                }).ToList(),
                new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    WriteIndented = true
                });
        }
        #endregion

        #region Check Delivered Qty Exceeded
        [HttpGet]
        public JsonResult CheckDeliveredQtyExceeded(long jisvohNumber, long? prsNumber = null, long? itemNumber = null, long? uomNumber = null)
        {
            var dt = new DeliveryNote_DAO()
                .CheckDeliveredQtyExceededDB(jisvohNumber, prsNumber, itemNumber, uomNumber)
                .Tables[0];

            return new JsonResult(dt.AsEnumerable().Select(r => new
            {
                deliveredQty = r["DeliveredQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["DeliveredQty"]),
                jisvoiQty = r["JISVOI_Qty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["JISVOI_Qty"]),
                isExceeded = r["IsExceeded"] != DBNull.Value && Convert.ToBoolean(r["IsExceeded"])
            }).ToList());
        }
        #endregion


        #region Receiptnote submit
        ReceiptNote_DTO SI_DTO = new ReceiptNote_DTO();
        ReceiptNote_DAO SI_DAO = new ReceiptNote_DAO();
        [HttpPost]
        [Route("receiptnote/transactions/conversion/create")]
        public IActionResult CreateReceiptNote(ReceiptNoteHead_DTO S_DTO, String? Mode)
        {
            var Original_DTO = Help.JsonClone(S_DTO);

            bool IsValid = false;
            ReceiptNoteHead_DTO S_Head_DTO = new ReceiptNoteHead_DTO();

            List<ReceiptNoteItem_DTO>? ITM_DTO = new List<ReceiptNoteItem_DTO>();
            List<ReceiptNoteBatch_DTO>? BCH_DTO = new List<ReceiptNoteBatch_DTO>();
            S_Head_DTO = S_DTO;

            if (S_DTO.Items != null)
                ITM_DTO = S_DTO.Items!.Where(K => K.IsDeleted == "0").ToList();

            if (S_DTO.Items != null)
                BCH_DTO = S_DTO.ItemBatch!.Where(K => K.RNI_BCH_IsDeleted == "false").ToList();

            SI_DTO.JIRN_CreatorCode = Convert.ToInt64(1);
            // SI_DTO.JIRN_CreatorCode = Convert.ToInt64(UserCode);
            if (Mode == "Save")
            {
                //var CheckItem = ITM_DTO.Where(x => Convert.ToInt64(x.Item_Number) != Convert.ToInt64(S_DTO.MS_Number));
                ITM_DTO = ITM_DTO
    .Where(x => !string.IsNullOrWhiteSpace(x.Item_Number))
    .ToList();
                var ValueItem = ITM_DTO.Where(x => Convert.ToDouble(x.Qty) == 0 || Convert.ToDouble(x.UnitPrice) == 0 || Convert.ToDouble(x.Amount) == 0);

                //if (CheckItem.ToList().Count > 0)
                //{
                //    ViewBag.ErrorCode = 2;
                //    ViewBag.ErrorMessage = "Material Segregation and Item Mismatched";
                //}
                //else
                if (ValueItem.ToList().Count > 0)
                {
                    ViewBag.ErrorCode = 2;
                    ViewBag.ErrorMessage = "Qty or Unit Price Must above one";
                }
                else if (ITM_DTO.Count == 0)
                {
                    ViewBag.ErrorCode = 2;
                    ViewBag.ErrorMessage = "Item Atleast, One Row Required";
                }
                else if (Convert.ToInt32(S_DTO.JWC_Number) == 0)
                {
                    ViewBag.ErrorCode = 2;
                    ViewBag.ErrorMessage = "Buyer is Required";
                }
                else
                {
                    ModelState.Clear();
                    S_Head_DTO.Items = ITM_DTO;

                    IsValid = TryValidateModel(S_Head_DTO);

                    if (IsValid)
                    {
                        // if (BatchValidation(ITM_DTO))
                        {
                            using (var transaction = new TransactionScope(TransactionScopeOption.Required,
      new TransactionOptions
      {
          IsolationLevel = System.Transactions.IsolationLevel.ReadCommitted
      }))

                            {
                                try
                                {
                                    string SIHOrderNoOld = S_DTO.RN_No;

                                   // String SIHOrderNoNew = OnReceiptNoteNumber(Convert.ToInt32(Convert.ToDateTime(S_DTO.RN_Date).ToString("yyyyMMdd")));
                                    String SIHOrderNoNew = SIHOrderNoOld;

                                    // =========================
                                    // 🔹 HEADER INSERT
                                    // =========================
                                    SI_DTO.JIRNH_RN_Date = Convert.ToDateTime(S_DTO.RN_Date);
                                    SI_DTO.JIRNH_RN_No = SIHOrderNoOld;
                                    SI_DTO.JIRNH_JWC_Number = Convert.ToInt64(S_DTO.JWC_Number);
                                    SI_DTO.JIRNH_Currency_Number = Convert.ToInt64(S_DTO.Currency_Number);
                                    SI_DTO.JIRNH_JW_CustomerDC_No = Convert.ToString(S_DTO.JW_CustomerDC_No);
                                    SI_DTO.JIRNH_JW_CustomerDC_Date = Convert.ToDateTime(S_DTO.JW_CustomerDC_Date);
                                    SI_DTO.JIRNH_MS_Number = Convert.ToInt64(S_DTO.MS_Number);
                                    SI_DTO.JIRNH_Remarks = Convert.ToString(S_DTO.Remarks);
                                    SI_DTO.JIRNH_WH_Number = Convert.ToInt64(S_DTO.WH_Number);
                                    SI_DTO.JIRN_Id = 21;

                                    DS = SI_DAO.JI_ReceiptNoteDB(SI_DTO);



                                    if (DS == null || DS.Tables.Count == 0 || DS.Tables[0].Rows.Count == 0)
                                        throw new Exception("Header insert failed");

                                    long headerId = Convert.ToInt64(DS.Tables[0].Rows[0][0]);

                                    // =========================
                                    // 🔹 ITEM LOOP
                                    // =========================
                                    foreach (var Item in ITM_DTO)
                                    {
                                        var itemDTO = new ReceiptNote_DTO(); // 🔥 IMPORTANT FIX (NO REUSE)

                                        itemDTO.JIRNH_Number = headerId;
                                        itemDTO.JIRNI_Item_Number = Convert.ToInt64(Item.Item_Number);
                                        itemDTO.JIRNI_WH_Number = Convert.ToInt64(Item.WH_Number);
                                        itemDTO.JIRNI_UoM_Number = Convert.ToInt64(Item.UoM_Number);
                                        itemDTO.JIRNI_Qty = Convert.ToDouble(Item.Qty);
                                        itemDTO.JIRNI_UnitPrice = Convert.ToDouble(Item.UnitPrice);
                                        itemDTO.JIRNI_Amount = Convert.ToDouble(Item.Amount);
                                        itemDTO.JIRNI_PRS_Number = Convert.ToInt64(Item.PRS_Number);
                                        itemDTO.JIRN_Id = 22;

                                        var itemResult = SI_DAO.JI_ReceiptNoteDB(itemDTO);

                                        if (itemResult == null || itemResult.Tables.Count == 0 || itemResult.Tables[0].Rows.Count == 0)
                                            throw new Exception("Item insert failed");

                                        long itemID = Convert.ToInt64(itemResult.Tables[0].Rows[0][0]);

                                        // =========================
                                        // 🔹 BATCH INSERT (FIXED)
                                        // =========================

                                        var relatedBatches = BCH_DTO
                                            .Where(x => x.RNI_BCH_Item_Number == Item.Item_Number)
                                            .ToList();

                                        foreach (var batch in relatedBatches)
                                        {
                                            var batchDTO = new ReceiptNote_DTO(); // 🔥 NEW OBJECT

                                            batchDTO.JIRNI_BCH_Number = batch.RNI_BCH_No;
                                            batchDTO.JIRNI_Item_Number = Convert.ToInt64(Item.Item_Number);
                                            batchDTO.JIRNH_Number = headerId;
                                            batchDTO.JIRNI_Number = itemID;
                                            batchDTO.JIRNI_BCH_BatchDate = DateTime.Now;
                                            //   batchDTO.JIRNI_BCH_BatchNo = "AUTO-" + headerId;
                                            batchDTO.JIRNI_BCH_BatchNo = batch.RNI_BCH_Number;
                                            batchDTO.JIRNI_BCH_WH_Number = Convert.ToInt64(Item.WH_Number);
                                            batchDTO.JIRNI_BCH_BatchQty = Convert.ToDouble(batch.RNI_BCH_Qty);
                                            batchDTO.JIRNI_BCH_BatchUnitPrice = Convert.ToDouble(batch.RNI_BCH_UnitPrice);
                                            batchDTO.JIRNI_BCH_BatchValue = Convert.ToDouble(batch.RNI_BCH_Value);
                                            batchDTO.JIRNH_WH_Number = Convert.ToInt64(S_DTO.WH_Number);
                                            batchDTO.JIRNI_WH_Number = Convert.ToInt64(Item.WH_Number);
                                            batchDTO.JIRN_Id = 23;

                                            SI_DAO.JI_ReceiptNoteDB(batchDTO);
                                        }
                                    }

                                    // =========================
                                    // 🔹 COMMIT
                                    // =========================
                                    transaction.Complete();

                                    // =========================
                                    // 🔹 CLEANUP
                                    // =========================
                                    S_Head_DTO.Reset();
                                    ITM_DTO = null;
                                    S_DTO.Reset();
                                    Original_DTO = Help.JsonClone(S_DTO);

                                    if (SIHOrderNoOld != SIHOrderNoNew)
                                    {
                                        ViewBag.ErrorCode = 2;
                                        ViewBag.ErrorMessage =
                                            "Receipt Note number " + SIHOrderNoOld + " changed to " + SIHOrderNoNew;
                                    }

                                    return RedirectToAction("CreateReceiptNote");
                                }
                                catch (Exception ex)
                                {
                                    ViewBag.ErrorCode = 2;
                                    ViewBag.ErrorMessage = Valid.CatchValid(ex.Message);
                                    throw;
                                }
                            }
                        }

                    }
                    else
                    {
                        var Errors = ModelState.SelectMany(m => m.Value!.Errors.Select(s => new { s.ErrorMessage })).Select(p => p.ErrorMessage);
                        string CombinedString = string.Join("<br/>", Errors);

                        ViewBag.ErrorCode = 2;
                        ViewBag.ErrorMessage = CombinedString;
                    }
                }
            }


          //  ReceiptGetData();
            return View(Original_DTO);
        }


        #endregion

    }



}
