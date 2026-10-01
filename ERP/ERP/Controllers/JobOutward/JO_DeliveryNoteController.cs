using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobInwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;
using System.Text.Json;

namespace ERP.Controllers.JobworkOutward
{
    public class JO_DeliveryNoteController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();

        // summary / detailed paging
        Int32? DPageNumber;
        Int32 DPageSize;
        List<JO_DeliveryNoteSummary_DTO> DNS_List = new List<JO_DeliveryNoteSummary_DTO>();
        List<JO_DeliveryNoteDetailed_DTO> DND_List = new List<JO_DeliveryNoteDetailed_DTO>();

        JO_DeliveryNoteSummary_DTO DNS_DTO = new JO_DeliveryNoteSummary_DTO();
        JO_DeliveryNote_DAO DN_DAO = new JO_DeliveryNote_DAO();
        JO_DeliveryNote_DL DN_DL = new JO_DeliveryNote_DL();

        // numbering
        JO_DNNumber_DTO PON_DTO = new JO_DNNumber_DTO();
        JO_DN_Numbering_DAO PON_DAO = new JO_DN_Numbering_DAO();

        const string ViewRoot = "~/Views/JobworkOutward/DeliveryNote/";

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;

        static readonly JsonSerializerOptions CamelOpt = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        #region date helpers
        // Browser sends picked dates as UTC (e.g. 2026-09-19T18:30:00Z for 20-Sep in IST).
        // Convert back to server-local so the saved date is the date the user picked.
        private static DateTime FromBrowserUtc(DateTime d)
        {
            return d.Kind == DateTimeKind.Utc ? d.ToLocalTime() : d;
        }

        private static void FixDeliveryNoteDates(JO_DeliveryNoteCreate_DTO dto)
        {
            if (dto?.Header != null)
                dto.Header.JODNH_DN_Date = FromBrowserUtc(dto.Header.JODNH_DN_Date);

            if (dto?.deliveryNoteBatches != null)
                foreach (var b in dto.deliveryNoteBatches)
                    b.JODNI_BCH_BatchDate = FromBrowserUtc(b.JODNI_BCH_BatchDate);
        }
        #endregion

        #region number generation (date change)
        // Manual numbering (method 2): returns the number shown on the page for the picked date
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/numbering")]
        public string OnDeliveryNoteNumber(Int32 DNDate)
        {
            DateTime dnDate = DateTime.ParseExact(
                DNDate.ToString(), "yyyyMMdd", CultureInfo.InvariantCulture);

            JO_DeliveryNoteCreate_DTO DN_DTO = new JO_DeliveryNoteCreate_DTO();
            DN_DTO.Header.JODNH_DN_Date = dnDate;
            DN_DTO.Header.DN_Id = 0;
            DN_DTO.Header.DN_CreatorCode = 0;
            DS = DN_DAO.DeliveryNoteDB(DN_DTO);

            if (DS.Tables[0].Rows.Count == 0 || DS.Tables[1].Rows.Count == 0)
            {
                ViewBag.ErrorCode = 2;
                ViewBag.ErrorMessage = "Delivery Note Number is not configured for the selected Delivery Date.";
                return "";
            }

            int order = Convert.ToInt32(DS.Tables[0].Rows[0]["JODN_NM_Method"]);
            if (order != 2)
                return "";

            string prefix = "";
            string suffix = "";
            string prefill = "";
            int number = 0;

            if (DS.Tables[2].Rows.Count > 0)
                prefix = DS.Tables[2].Rows[0]["JODN_Prefix_Particulars"].ToString();

            if (DS.Tables[3].Rows.Count > 0)
                suffix = DS.Tables[3].Rows[0]["JODN_Suffix_Particulars"].ToString();

            int startNumber = Convert.ToInt32(DS.Tables[1].Rows[0]["JODN_NR_StartingNumber"]);
            int digit = Convert.ToInt32(DS.Tables[1].Rows[0]["JODN_NR_NumberofDigits"]);
            int prefillZero = Convert.ToInt32(DS.Tables[1].Rows[0]["JODN_NR_PrefilZero"]);

            if (prefillZero == 1)
                prefill = "D" + digit;

            if (DS.Tables[4].Rows.Count > 0)
            {
                int runningNumber = Convert.ToInt32(DS.Tables[4].Rows[0]["JODN_RN_StartingNumber"]);
                number = runningNumber + 1;
            }
            else
            {
                number = startNumber;
            }

            return prefix + number.ToString(prefill) + suffix;
        }

        // Auto numbering: next number from JO_DN_GetNextNumber_SP
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/next-dn-number")]
        public string OnDeliveryNoteNextNumber(DateTime DNDate)
        {
            JO_DN_NextNumber_DTO DTO = new JO_DN_NextNumber_DTO();
            DTO.Id = 101;
            DTO.DNDate = DNDate;
            DTO.CreatorCode = 0;

            try
            {
                DTO = new JO_DN_NextNumber_DAO().JO_DN_NextNumberDB(DTO);
            }
            catch (Exception)
            {
                ViewBag.ErrorCode = 2;
                ViewBag.ErrorMessage = "DN Number is not configured for the selected Delivery Date.";
                return "";
            }

            return DTO.FinalDNNumber;
        }

        // After save: move the running number forward (manual numbering only)
        void OnDeliveryNoteNumberGen(Int32 DNDate)
        {
            DataSet DS1 = new DataSet();

            PON_DTO.JODN_NM_Date = DNDate.ToString();
            PON_DTO.CreatorCode = 1;
            PON_DTO.Id = 101;

            DS1 = PON_DAO.JO_DN_NumberingDB(PON_DTO);

            if (DS1.Tables[0].Rows.Count > 0)
            {
                Int32 Order = Convert.ToInt32(DS1.Tables[0].Rows[0]["JODN_NM_Method"].ToString());

                if (Order == 2)
                {
                    if (DS1.Tables[1].Rows.Count > 0)
                    {
                        // existing range -> increment
                        Int32 Number = Convert.ToInt32(DS1.Tables[1].Rows[0]["JODN_RN_StartingNumber"].ToString());

                        PON_DTO.JODN_NM_Number = Convert.ToInt32(DS1.Tables[1].Rows[0]["JODN_RN_NR_Number"].ToString());
                        PON_DTO.JODN_NM_StartingNumber = Convert.ToString(Number + 1);
                        PON_DTO.CreatorCode = 1;
                        PON_DTO.Id = 103;

                        PON_DAO.JO_DN_NumberingDB(PON_DTO);
                    }
                    else if (DS1.Tables[2].Rows.Count > 0)
                    {
                        // new range -> insert fresh, using setup dates directly
                        DateTime StartDate = Convert.ToDateTime(DS1.Tables[2].Rows[0]["JODN_NR_Date"].ToString());
                        DateTime EndDate = Convert.ToDateTime(DS1.Tables[2].Rows[0]["JODN_NR_EndDate"].ToString());
                        Int32 Start = Convert.ToInt32(DS1.Tables[2].Rows[0]["JODN_NR_StartingNumber"].ToString());

                        PON_DTO.JODN_NM_Number = Convert.ToInt32(DS1.Tables[2].Rows[0]["JODN_NR_Number"].ToString());
                        PON_DTO.JODN_NM_StartingNumber = Convert.ToString(Start);
                        PON_DTO.JODN_NM_Date = Convert.ToString(StartDate.ToString("yyyyMMdd"));
                        PON_DTO.JODN_NM_Method = Convert.ToString(EndDate.ToString("yyyyMMdd")); // SP uses @DNN_Method as end date for Id 102
                        PON_DTO.CreatorCode = 1;
                        PON_DTO.Id = 102;

                        PON_DAO.JO_DN_NumberingDB(PON_DTO);
                    }
                }
            }
        }
        #endregion

        #region lookups (vendor / address / item)
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/vendor")]
        public IActionResult DNVendor(String? Vendor, String? DNDate)
        {
            JO_DeliveryNoteCreate_DTO DN_DTO = new JO_DeliveryNoteCreate_DTO();

            if (Vendor == null)
                Vendor = "";

            DN_DTO.Header.JODNI_Item_Code = Convert.ToString(Vendor);
            DN_DTO.Header.JODNH_DN_Date = Convert.ToDateTime(DNDate);
            DN_DTO.Header.DN_Id = 5;
            DataSet ds = DN_DAO.DeliveryNoteDB(DN_DTO);
            return Json(DN_DL.VendorList(ds.Tables[0]));
        }

        // address ids + first address of a vendor for the chosen address type
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/vendor-address")]
        public IActionResult DNVendorAddress(String? Vendor, String ADTPNumber)
        {
            JO_DeliveryNoteCreate_DTO DN_DTO = new JO_DeliveryNoteCreate_DTO();

            if (Vendor == null)
                Vendor = "";

            DN_DTO.Header.DN_JWV_Number = Convert.ToInt64(Vendor);
            DN_DTO.Header.DN_ADD_ADTP_Number = Convert.ToInt32(ADTPNumber);
            DN_DTO.Header.JODNH_DN_Date = DateTime.Now;
            DN_DTO.Header.DN_Id = 13;
            DataSet ds = DN_DAO.DeliveryNoteDB(DN_DTO);

            JO_DNAddressLookup_DTO res = new JO_DNAddressLookup_DTO();
            res.AddressIds = DN_DL.VendorAddressID(ds.Tables[0]);
            res.Address = DN_DL.VendorAddress(ds.Tables[1]).FirstOrDefault();
            return Json(res);
        }

        // one address picked by its Address ID
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/vendor-address-id")]
        public IActionResult DNVendorAddressInfo(String? Vendor, String ADTPNumber, String AddressID)
        {
            JO_DeliveryNoteCreate_DTO DN_DTO = new JO_DeliveryNoteCreate_DTO();

            if (Vendor == null)
                Vendor = "";

            DN_DTO.Header.DN_JWV_Number = Convert.ToInt64(Vendor);
            DN_DTO.Header.DN_ADD_ADTP_Number = Convert.ToInt32(ADTPNumber);
            DN_DTO.Header.DN_ADD_Addressid = Convert.ToString(AddressID);
            DN_DTO.Header.JODNH_DN_Date = DateTime.Now;
            DN_DTO.Header.DN_Id = 14;
            DataSet ds = DN_DAO.DeliveryNoteDB(DN_DTO);

            JO_DNAddressLookup_DTO res = new JO_DNAddressLookup_DTO();
            res.Address = DN_DL.VendorAddress(ds.Tables[0]).FirstOrDefault();
            return Json(res);
        }

        // item search (same item master search as the Receipt Note pages)
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/item")]
        public IActionResult DNItem(String? ItemCode, String MS)
        {
            ReceiptNote_DTO SI_DTO = new ReceiptNote_DTO();
            ReceiptNote_DAO SI_DAO = new ReceiptNote_DAO();
            ReceiptNote_DL S_DL = new ReceiptNote_DL();
            DataSet ds = new DataSet();

            if (ItemCode == null)
                ItemCode = "";
            if (MS == null)
                MS = "";

            SI_DTO.JIRN_CreatorCode = Convert.ToInt64(1);
            SI_DTO.JIRNI_ITM_Code = Convert.ToString(ItemCode);
            SI_DTO.JIRNH_MS_Number = Convert.ToInt64(MS);
            SI_DTO.JIRN_Id = 2;
            ds = SI_DAO.JI_ReceiptNoteDB(SI_DTO);
            var Item = S_DL.ItemList(ds.Tables[0]);
            return Json(Item);
        }

        // address saved on an existing delivery note (Edit page)
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/address")]
        public IActionResult DeliveryNoteAddressID(string? JODNHNumber, string ADTPNumber)
        {
            if (string.IsNullOrEmpty(JODNHNumber))
                JODNHNumber = "0";

            DS = DN_DAO.DeliveryNoteAddressEditDB(
                    Convert.ToInt64(JODNHNumber),
                    Convert.ToInt32(ADTPNumber));

            JO_DNAddressLookup_DTO res = new JO_DNAddressLookup_DTO();
            res.AddressIds = DN_DL.VendorAddressID(DS.Tables[0]);
            res.Address = DN_DL.VendorAddress(DS.Tables[1]).FirstOrDefault();
            return Json(res);
        }
        #endregion

        #region Delivery Note Create
        [Route("joboutward/transactions/delivery-note")]
        public IActionResult Index()
        {
            GetDeliveryNoteData();
            DN_DAO.DeleteTempDeliveryNoteBatch();
            ViewBag.Collapse = true;
            return View(ViewRoot + "Index.cshtml");
        }

        public void GetDeliveryNoteData()
        {
            JO_DeliveryNoteCreate_DTO DN_DTO = new JO_DeliveryNoteCreate_DTO();
            DN_DTO.Header.JODNH_DN_Date = DateTime.Now;
            DN_DTO.Header.DN_Id = 1;
            DataSet ds = DN_DAO.DeliveryNoteDB(DN_DTO);
            ViewBag.Currency = Help.GetCat(ds.Tables[4]);
            ViewBag.MaterialSegregation = Help.GetCat(ds.Tables[5]);
            ViewBag.UoM = Help.GetCat(ds.Tables[6]);
            ViewBag.Warehouse = Help.GetCat(ds.Tables[8]);
            ViewBag.AddressType = Help.GetCat(ds.Tables[12]);
            ViewBag.Process = Help.GetCat(ds.Tables[13]);
        }

        [HttpPost]
        [Route("joboutward/transactions/delivery-note/save")]
        public IActionResult SaveDeliveryNote([FromBody] JO_DeliveryNoteCreate_DTO dto)
        {
            try
            {
                if (dto == null)
                    return Json(new { success = false, message = "DTO is null" });

                if (dto.Header == null)
                    return Json(new { success = false, message = "Header is null" });

                FixDeliveryNoteDates(dto);
                dto.Header.DN_Id = 10;
                dto.Header.JODNI_Item_Code = "1";

                DataSet ds = DN_DAO.DeliveryNoteCreateDB(dto);
                OnDeliveryNoteNumberGen(Convert.ToInt32(Convert.ToDateTime(dto.Header.JODNH_DN_Date).ToString("yyyyMMdd")));
                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action("Index", "JO_DeliveryNote")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
        #endregion

        #region Delivery Note Summary
        [Route("joboutward/transactions/delivery-note-summary")]
        public IActionResult DeliveryNoteSummary(
            String? SortOrder,
            String? Search,
            Int32? PageNumber,
            Int32 PSize,
            String? PageFilter)
        {
            DNS_List = DNSummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(
                ViewRoot + "DeliveryNoteSummary.cshtml",
                PaginatedList_DTO<JO_DeliveryNoteSummary_DTO>
                    .CreateAsync(DNS_List, DPageNumber ?? 1, DPageSize));
        }

        [Route("joboutward/transactions/delivery-note-summary")]
        [HttpPost]
        public IActionResult DeliveryNoteSummary(
            String? SortOrder,
            String? Search,
            Int32? PageNumber,
            Int32 PSize,
            String? PageFilter,
            String? Mode,
            String? DeleteNumbers,
            String? DN_No,
            String[] DeleteNumber,
            String selectAllCheckbox)
        {
            JO_DeliveryNoteSummary_DTO DN_DTO = new JO_DeliveryNoteSummary_DTO();

            if (Mode == "Delete")
            {
                DN_DTO.JODNH_Number = Convert.ToInt64(DN_No);
                DN_DTO.DN_Id = 104;
                DN_DTO.DN_CreatorCode = Convert.ToInt32(UserCode);
                DS = DN_DAO.DeliveryNoteSummaryDB(DN_DTO);
                return RedirectToAction("DeliveryNoteSummary");
            }

            if (Mode == "View")
                return RedirectToAction("ViewNote", new { JODNH_Number = DN_No });

            if (Mode == "Edit")
                return RedirectToAction("Edit", new { JODNH_Number = DN_No });

            DNS_List = DNSummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);

            return View(
                ViewRoot + "DeliveryNoteSummary.cshtml",
                PaginatedList_DTO<JO_DeliveryNoteSummary_DTO>
                    .CreateAsync(DNS_List, DPageNumber ?? 1, DPageSize));
        }

        List<JO_DeliveryNoteSummary_DTO> DNSummaryGetData(
            String? SortOrder,
            String? Search,
            Int32? PageNumber,
            Int32 PSize,
            String? PageFilter)
        {
            DPageSize = 10;

            DNS_DTO.DN_Id = 1;
            DNS_DTO.DN_CreatorCode = Convert.ToInt32(UserCode);

            DS = DN_DAO.DeliveryNoteSummaryDB(DNS_DTO);
            DNS_List = DN_DL.DNSummaryList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder))
                SortOrder = "Title_desc";

            if (Convert.ToInt32(PageNumber) == 0)
                DPageNumber = 1;

            if (PageFilter?.ToLower() == "pagefilter")
                DPageNumber = 1;

            ViewData["CurrentSort"] = SortOrder;
            ViewData["KeySort"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;

            var Key = DNS_List.OrderByDescending(Cs => Cs.JODNH_Number);

            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>
                    K.JODNH_DN_Date.ToString().ToLower().Contains(Search.ToLower()) ||
                    (K.JODNH_DN_No ?? "").ToLower().Contains(Search.ToLower()) ||
                    (K.JWV_JW_VendorName ?? "").ToLower().Contains(Search.ToLower()) ||
                    (K.CurrencyCode ?? "").ToLower().Contains(Search.ToLower()) ||
                    (K.WarehouseCode ?? "").ToLower().Contains(Search.ToLower()) ||
                    K.JODNH_MS_Number.ToString().ToLower().Contains(Search.ToLower()) ||
                    K.NoOfLineItems.ToString().ToLower().Contains(Search.ToLower()) ||
                    (K.Qty ?? "").ToString().ToLower().Contains(Search.ToLower())
                ).OrderByDescending(Cs => Cs.JODNH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => K.JODNH_DN_Date);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => K.JODNH_DN_Date);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JODNH_Number);
                    break;
            }

            if (PSize != 0)
                DPageSize = PSize;

            Int32 Record = Key.ToList().Count;

            if (PageNumber > 1)
            {
                Int32 RecordPage = (Convert.ToInt32(PageNumber) - 1) * DPageSize;

                if (Record > RecordPage)
                {
                    DPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
                }
                else
                {
                    Double Page = Convert.ToDouble(Record) / Convert.ToDouble(DPageSize);
                    Int32 PageCount = Convert.ToInt32(Math.Ceiling(Page));
                    DPageNumber = PageNumber > PageCount ? PageCount : Convert.ToInt32(PageNumber);
                }
            }
            else
            {
                DPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
            }

            Double Pages = Convert.ToDouble(Record) / Convert.ToDouble(DPageSize);
            Int32 PageCounts = Convert.ToInt32(Math.Ceiling(Pages));

            ViewBag.SumOfItem = Key.Sum(item => Convert.ToDouble(item.NoOfLineItems));
            ViewBag.SumOfQty = Key.Sum(item => Convert.ToDouble(item.Qty));
            ViewBag.SumOfAmount = Key.Sum(item => Convert.ToDouble(item.Amount));

            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewData["PageNumber"] = DPageNumber;
            ViewData["PageSize"] = DPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Key.ToList().Count;

            return Key.ToList();
        }
        #endregion

        #region Delivery Note Detailed
        [Route("joboutward/transactions/delivery-note-detailed")]
        public IActionResult DeliveryNoteDetailed(
            String? SortOrder,
            String? Search,
            Int32? PageNumber,
            Int32 PSize,
            String? PageFilter)
        {
            DND_List = DNDetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(
                ViewRoot + "DeliveryNoteDetailed.cshtml",
                PaginatedList_DTO<JO_DeliveryNoteDetailed_DTO>
                    .CreateAsync(DND_List, DPageNumber ?? 1, DPageSize));
        }

        [Route("joboutward/transactions/delivery-note-detailed")]
        [HttpPost]
        public IActionResult DeliveryNoteDetailed(
            String? SortOrder,
            String? Search,
            Int32? PageNumber,
            Int32 PSize,
            String? PageFilter,
            String? Mode,
            String? DeleteNumbers,
            String? DN_No,
            String[] DeleteNumber,
            String selectAllCheckbox)
        {
            JO_DeliveryNoteSummary_DTO DN_DTO = new JO_DeliveryNoteSummary_DTO();

            if (Mode == "Delete")
            {
                DN_DTO.JODNH_Number = Convert.ToInt64(DN_No);
                DN_DTO.DN_Id = 104;
                DN_DTO.DN_CreatorCode = Convert.ToInt32(UserCode);
                DS = DN_DAO.DeliveryNoteSummaryDB(DN_DTO);
                return RedirectToAction("DeliveryNoteDetailed");
            }

            if (Mode == "View")
                return RedirectToAction("ViewNote", new { JODNH_Number = DN_No });

            if (Mode == "Edit")
                return RedirectToAction("Edit", new { JODNH_Number = DN_No });

            DND_List = DNDetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);

            return View(
                ViewRoot + "DeliveryNoteDetailed.cshtml",
                PaginatedList_DTO<JO_DeliveryNoteDetailed_DTO>
                    .CreateAsync(DND_List, DPageNumber ?? 1, DPageSize));
        }

        List<JO_DeliveryNoteDetailed_DTO> DNDetailedGetData(
            String? SortOrder,
            String? Search,
            Int32? PageNumber,
            Int32 PSize,
            String? PageFilter)
        {
            DPageSize = 10;

            DNS_DTO.DN_Id = 2;
            DNS_DTO.DN_CreatorCode = Convert.ToInt32(UserCode);

            DS = DN_DAO.DeliveryNoteSummaryDB(DNS_DTO);
            DND_List = DN_DL.DNDetailedList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder))
                SortOrder = "Title_desc";

            if (Convert.ToInt32(PageNumber) == 0)
                DPageNumber = 1;

            if (PageFilter?.ToLower() == "pagefilter")
                DPageNumber = 1;

            ViewData["CurrentSort"] = SortOrder;
            ViewData["KeySort"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;

            var Key = DND_List.OrderByDescending(Cs => Cs.JODNH_Number);

            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>
                    K.JODNH_DN_Date.ToString().ToLower().Contains(Search.ToLower()) ||
                    (K.JODNH_DN_No ?? "").ToLower().Contains(Search.ToLower()) ||
                    (K.JWV_JW_VendorName ?? "").ToLower().Contains(Search.ToLower()) ||
                    (K.CurrencyCode ?? "").ToLower().Contains(Search.ToLower()) ||
                    (K.WarehouseCode ?? "").ToLower().Contains(Search.ToLower()) ||
                    K.JODNH_MS_Number.ToString().ToLower().Contains(Search.ToLower())
                ).OrderByDescending(Cs => Cs.JODNH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc":
                    Key = Key.OrderByDescending(K => K.JODNH_DN_Date);
                    break;
                case "Title":
                    Key = Key.OrderBy(K => K.JODNH_DN_Date);
                    break;
                default:
                    Key = Key.OrderByDescending(K => K.JODNH_Number);
                    break;
            }

            if (PSize != 0)
                DPageSize = PSize;

            Int32 Record = Key.ToList().Count;

            if (PageNumber > 1)
            {
                Int32 RecordPage = (Convert.ToInt32(PageNumber) - 1) * DPageSize;

                if (Record > RecordPage)
                {
                    DPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
                }
                else
                {
                    Double Page = Convert.ToDouble(Record) / Convert.ToDouble(DPageSize);
                    Int32 PageCount = Convert.ToInt32(Math.Ceiling(Page));
                    DPageNumber = PageNumber > PageCount ? PageCount : Convert.ToInt32(PageNumber);
                }
            }
            else
            {
                DPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
            }

            Double Pages = Convert.ToDouble(Record) / Convert.ToDouble(DPageSize);
            Int32 PageCounts = Convert.ToInt32(Math.Ceiling(Pages));

            ViewBag.SumOfQty = Key.Sum(item => Convert.ToDouble(item.JODNI_Qty));
            ViewBag.SumOfQtyKgs = Key.Sum(item => Convert.ToDouble(item.JODNI_Qty_Kgs));
            ViewBag.SumOfAmount = Key.Sum(item => Convert.ToDouble(item.JODNI_Amount));
            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewData["PageNumber"] = DPageNumber;
            ViewData["PageSize"] = DPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Key.ToList().Count;

            return Key.ToList();
        }
        #endregion

        #region Edit / View page
        [Route("joboutward/transactions/delivery-note/edit")]
        public IActionResult Edit(long JODNH_Number)
        {
            return LoadDeliveryNotePage(JODNH_Number, false);
        }

        // Read-only page: same page and data as Edit, nothing is written to the temp batch table
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/view")]
        public IActionResult ViewNote(long JODNH_Number)
        {
            return LoadDeliveryNotePage(JODNH_Number, true);
        }

        private IActionResult LoadDeliveryNotePage(long JODNH_Number, bool isViewMode)
        {
            JO_DeliveryNoteCreate_DTO dto = new JO_DeliveryNoteCreate_DTO();

            GetDeliveryNoteData();

            DataSet ds = DN_DAO.DeliveryNoteEditDB(JODNH_Number);

            long Root_JODNI_Number = 0;

            if (ds.Tables[0].Rows.Count > 0)
            {
                DataRow dr = ds.Tables[0].Rows[0];

                dto.Header.JODNH_Number = Convert.ToInt64(dr["JODNH_Number"]);
                dto.Header.JODNH_DN_No = Convert.ToString(dr["JODNH_DN_No"]);
                dto.Header.JODNH_DN_Date = Convert.ToDateTime(dr["JODNH_DN_Date"]);
                dto.Header.JODNH_MS_Number = Convert.ToInt64(dr["JODNH_MS_Number"]);
                dto.Header.JODNH_JW_Vendor_Number = Convert.ToInt64(dr["JODNH_JW_Vendor_Number"]);
                dto.Header.JODNH_JW_Vendor_Name = Convert.ToString(dr["JODNH_JW_Vendor_Name"]);
                dto.Header.JODNH_Currency_Number = Convert.ToInt64(dr["JODNH_Currency_Number"]);
                dto.Header.JODNH_WH_Number = Convert.ToInt64(dr["JODNH_WH_Number"]);
                dto.Header.JODNH_IsFreightApplicable =
                    dr["JODNH_IsFreightApplicable"] != DBNull.Value
                        ? Convert.ToString(dr["JODNH_IsFreightApplicable"])
                        : "No";
                dto.Header.JODNH_PaymentTerms = Convert.ToString(dr["JODNH_PaymentTerms"]);
                dto.Header.JODNH_DeliveryTerms = Convert.ToString(dr["JODNH_DeliveryTerms"]);
                dto.Header.JODNH_DeliveryMode = Convert.ToString(dr["JODNH_DeliveryMode"]);
                dto.Header.JODNH_DespatchDocumentNo = Convert.ToString(dr["JODNH_DespatchDocumentNo"]);
                dto.Header.JODNH_DespatchedThrough = Convert.ToString(dr["JODNH_DespatchedThrough"]);
                dto.Header.JODNH_Remarks = Convert.ToString(dr["JODNH_Remarks"]);
            }

            // ITEMS
            dto.Items = new List<JO_DeliveryNoteItem_DTO>();

            foreach (DataRow item in ds.Tables[1].Rows)
            {
                long currentNumber = Convert.ToInt64(item["JODNI_Number"]);

                if (Root_JODNI_Number == 0)
                    Root_JODNI_Number = currentNumber;

                dto.Items.Add(new JO_DeliveryNoteItem_DTO
                {
                    JODNI_Number = currentNumber,
                    JODNI_JPRS_Number = Convert.ToInt64(item["JODNI_JPRS_Number"]),
                    JODNI_Item_Number = Convert.ToInt64(item["JODNI_Item_Number"]),
                    JODNI_Item_Code = Convert.ToString(item["JODNI_Item_Code"]),
                    JODNI_Item_Description = Convert.ToString(item["JODNI_Item_Description"]),
                    JODNI_OuterDia = Convert.ToString(item["JODNI_OuterDia"]),
                    JODNI_Thickness = Convert.ToString(item["JODNI_Thickness"]),
                    JODNI_Length = Convert.ToString(item["JODNI_Length"]),
                    JODNI_Width = Convert.ToString(item["JODNI_Width"]),
                    JODNI_MaterialGrade = Convert.ToString(item["JODNI_MaterialGrade"]),
                    JODNI_ItemGroup = Convert.ToString(item["JODNI_ItemGroup"]),
                    JODNI_WH_Number = Convert.ToInt64(item["JODNI_WH_Number"]),
                    JODNI_UoM_Number = Convert.ToInt64(item["JODNI_UoM_Number"]),
                    JODNI_Qty = Convert.ToDouble(item["JODNI_Qty"]),
                    JODNI_Qty_Kgs = item["JODNI_Qty_Kgs"] != DBNull.Value
                        ? Convert.ToDouble(item["JODNI_Qty_Kgs"])
                        : 0,
                    JODNI_UnitPrice = Convert.ToDouble(item["JODNI_UnitPrice"]),
                    JODNI_Amount = Convert.ToDouble(item["JODNI_Amount"]),

                    // Freight
                    JODNI_IsFreightApplicable =
                        item["JODNI_IsFreightApplicable"] != DBNull.Value
                            ? Convert.ToString(item["JODNI_IsFreightApplicable"])
                            : "No",
                    JODNI_JOFRT_SVOH_Number =
                        item["JODNI_JOFRT_SVOH_Number"] != DBNull.Value
                            ? Convert.ToInt64(item["JODNI_JOFRT_SVOH_Number"])
                            : 0,
                    JODNI_JOFRT_SVOI_Number =
                        item["JODNI_JOFRT_SVOI_Number"] != DBNull.Value
                            ? Convert.ToInt64(item["JODNI_JOFRT_SVOI_Number"])
                            : 0,
                    JODNI_FromWH_Number =
                        item["JODNI_FromWH_Number"] != DBNull.Value
                            ? Convert.ToInt64(item["JODNI_FromWH_Number"])
                            : 0,
                    JODNI_ToWH_Number =
                        item["JODNI_ToWH_Number"] != DBNull.Value
                            ? Convert.ToInt64(item["JODNI_ToWH_Number"])
                            : 0
                });
            }

            // ADDRESS
            dto.Addresses = new List<JO_DeliveryNoteAddress_DTO>();

            foreach (DataRow add in ds.Tables[2].Rows)
            {
                dto.Addresses.Add(new JO_DeliveryNoteAddress_DTO
                {
                    JODNA_Address = Convert.ToString(add["JODNA_Address"])
                });
            }

            if (!isViewMode)
                DN_DAO.InsertEditBatchToTempDB(Root_JODNI_Number);

            ViewBag.Collapse = true;
            ViewBag.IsViewMode = isViewMode;
            return View(ViewRoot + "Edit.cshtml", dto);
        }

        [HttpPost]
        [Route("joboutward/transactions/delivery-note/update")]
        public IActionResult UpdateDeliveryNote([FromBody] JO_DeliveryNoteCreate_DTO dto)
        {
            try
            {
                FixDeliveryNoteDates(dto);

                DN_DAO.DeliveryNoteUpdateDB(dto);
                DN_DAO.DeleteTempDeliveryNoteBatch();
                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action("DeliveryNoteSummary", "JO_DeliveryNote")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Route("joboutward/transactions/delivery-note/delete-removed-rows")]
        public IActionResult DeleteRemovedRows([FromBody] List<JO_DeletedRowInfo_DTO> deletedRows)
        {
            DN_DAO.DeleteRemovedRowsDB(deletedRows);
            return Json(new { success = true });
        }
        #endregion

        #region batch popups (json)
        // View page: batches saved on one item row (read-only)
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/saved-batch-details")]
        public JsonResult GetSavedBatchDetails(long JODNH_Number, long JODNI_Number)
        {
            DataTable dt = DN_DAO.GetSavedBatchDetails(JODNH_Number, JODNI_Number);
            var data = dt.AsEnumerable().Select(r => new
            {
                LineBatch_Number = r["LineBatch_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["LineBatch_Number"]),
                BatchDate = r["BatchDate"] == DBNull.Value ? "" : Convert.ToDateTime(r["BatchDate"]).ToString("dd MMM yyyy"),
                BatchNo = r["BatchNo"] == DBNull.Value ? "" : r["BatchNo"].ToString(),
                BatchQty = r["BatchQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchQty"]),
                BatchUnitPrice = r["BatchUnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchUnitPrice"]),
                BatchValue = r["BatchValue"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchValue"]),
                WareHouseCode = r["WareHouseCode"] == DBNull.Value ? "" : r["WareHouseCode"].ToString()
            }).ToList();
            return new JsonResult(data, CamelOpt);
        }

        // Create page: stock batches
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/batch-details")]
        public JsonResult GetBatchDetails(long FromWarehouse, long LineItem_Number, int ItemGridIndex)
        {
            DataTable dt = DN_DAO.GetBatchDetailsDB(FromWarehouse, LineItem_Number, ItemGridIndex).Tables[0];
            var data = dt.AsEnumerable().Select(r => new
            {
                LineBatch_Number = r["LineBatch_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["LineBatch_Number"]),
                FromWarehouse = r["FromWarehouse"] == DBNull.Value ? 0 : Convert.ToInt64(r["FromWarehouse"]),
                BatchDate = r["BatchDate"] == DBNull.Value ? "" : Convert.ToDateTime(r["BatchDate"]).ToString("dd MMM yyyy"),
                BatchNo = r["BatchNo"] == DBNull.Value ? "" : r["BatchNo"].ToString(),
                BatchQty = r["BatchQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchQty"]),
                ReservedQty = r["ReservedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["ReservedQty"]),
                DeliveredQty = r["DeliveredQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["DeliveredQty"]),
                AvailableQty = r["AvailableQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["AvailableQty"]),
                BatchUnitPrice = r["BatchUnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchUnitPrice"]),
                BatchValue = r["BatchValue"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchValue"]),
                WareHouseCode = dt.Columns.Contains("WarehouseCode") && r["WarehouseCode"] != DBNull.Value
                    ? r["WarehouseCode"].ToString() : ""
            }).ToList();
            return new JsonResult(data, CamelOpt);
        }

        // Edit page: stock batches (item may have changed)
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/batch-details-edit")]
        public JsonResult GetBatchDetailsEdit(long FromWarehouse, long LineItem_Number, long JODNI_Number, int ItemGridIndex, long JODNH_Number)
        {
            DataTable dt = DN_DAO.GetBatchStockDetails(LineItem_Number, FromWarehouse, JODNH_Number, JODNI_Number, ItemGridIndex);

            var data = dt.AsEnumerable().Select(r => new
            {
                LineBatch_Number = r["LineBatch_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["LineBatch_Number"]),
                FromWarehouse = r["FromWarehouse"] == DBNull.Value ? 0 : Convert.ToInt64(r["FromWarehouse"]),
                BatchDate = r["BatchDate"] == DBNull.Value ? "" : Convert.ToDateTime(r["BatchDate"]).ToString("dd MMM yyyy"),
                BatchNo = r["BatchNo"] == DBNull.Value ? "" : r["BatchNo"].ToString(),
                BatchQty = r["BatchQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchQty"]),
                ReservedQty = r["ReservedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["ReservedQty"]),
                DeliveredQty = r["DeliveredQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["DeliveredQty"]),
                AvailableQty = r["AvailableQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["AvailableQty"]),
                BatchUnitPrice = r["BatchUnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchUnitPrice"]),
                BatchValue = r["BatchValue"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchValue"]),
                RefBatch_Number = r["RefBatch_Number"] == DBNull.Value ? 0 : Convert.ToDecimal(r["RefBatch_Number"]),
                WareHouseCode = dt.Columns.Contains("WarehouseCode") && r["WarehouseCode"] != DBNull.Value
                    ? r["WarehouseCode"].ToString() : ""
            }).ToList();
            return new JsonResult(data, CamelOpt);
        }

        // View page: batch stock popup
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/batch-details-view")]
        public JsonResult GetBatchDetailsViewDB(long FromWarehouse, long LineItem_Number)
        {
            DataTable dt = DN_DAO.GetBatchDetailsViewDB(FromWarehouse, LineItem_Number).Tables[0];
            var data = dt.AsEnumerable().Select(r => new
            {
                BatchDate = r["BatchDate"] == DBNull.Value ? "" : Convert.ToDateTime(r["BatchDate"]).ToString("dd MMM yyyy"),
                BatchNo = r["BatchNo"] == DBNull.Value ? "" : r["BatchNo"].ToString(),
                BatchQty = r["BatchQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchQty"]),
                BatchUnitPrice = r["BatchUnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchUnitPrice"]),
                BatchValue = r["BatchValue"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchValue"]),
                WareHouseCode = dt.Columns.Contains("WarehouseCode") && r["WarehouseCode"] != DBNull.Value
                    ? r["WarehouseCode"].ToString() : ""
            }).ToList();
            return new JsonResult(data, CamelOpt);
        }

        // Other warehouse batches
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/other-batch-details")]
        public JsonResult GetOtherBatchDetails(long FromWarehouse, long LineItem_Number, int ItemGridIndex)
        {
            DataTable dt = DN_DAO.GetOtherBatchDetailsDB(FromWarehouse, LineItem_Number, ItemGridIndex).Tables[0];
            var data = dt.AsEnumerable().Select(r => new
            {
                LineBatch_Number = r["LineBatch_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["LineBatch_Number"]),
                FromWarehouse = r["FromWarehouse"] == DBNull.Value ? 0 : Convert.ToInt64(r["FromWarehouse"]),
                BatchDate = r["BatchDate"] == DBNull.Value ? "" : Convert.ToDateTime(r["BatchDate"]).ToString("dd MMM yyyy"),
                BatchNo = r["BatchNo"] == DBNull.Value ? "" : r["BatchNo"].ToString(),
                BatchQty = r["BatchQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchQty"]),
                AvailableQty = r["AvailableQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["AvailableQty"]),
                BatchUnitPrice = r["BatchUnitPrice"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchUnitPrice"]),
                BatchValue = r["BatchValue"] == DBNull.Value ? 0 : Convert.ToDecimal(r["BatchValue"]),
                WareHouseCode = dt.Columns.Contains("WarehouseCode") && r["WarehouseCode"] != DBNull.Value
                    ? r["WarehouseCode"].ToString() : ""
            }).ToList();
            return new JsonResult(data, CamelOpt);
        }
        #endregion

        #region batch validation
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/validate-batch-details")]
        public JsonResult ValidateBatchDetails(long JODNH_Number)
        {
            string validationMessage = DN_DAO.ValidateBatchDetails(JODNH_Number);

            var result = new
            {
                Status = string.IsNullOrEmpty(validationMessage),
                Message = validationMessage
            };
            return new JsonResult(result, CamelOpt);
        }

        [HttpGet]
        [Route("joboutward/transactions/delivery-note/validate-amended-batch-qty")]
        public JsonResult Validate_Amended_BatchQty(long JODNH_Number)
        {
            var data = DN_DAO.Validate_Amended_BatchQty(JODNH_Number);

            var result = new
            {
                status = true,
                data = data
            };
            return new JsonResult(result, CamelOpt);
        }
        #endregion

        #region temp batch
        // save all temp batch rows (bulk)
        [HttpPost]
        [Route("joboutward/transactions/delivery-note/save-temp-batch")]
        public IActionResult SaveTempDeliveryBatch([FromBody] List<JO_TempDeliveryBatch_DTO> dtoList)
        {
            try
            {
                if (dtoList == null || dtoList.Count == 0)
                    return Json(new { success = false, message = "DTO list is empty" });

                DN_DAO.TempDeliveryBatchSaveDB(dtoList);
                DN_DAO.UpdateTempBatchReservedQty();

                return Json(new
                {
                    success = true,
                    message = "Batch Saved Successfully",
                    count = dtoList.Count
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // add one temp batch row (4 values only)
        [HttpPost]
        [Route("joboutward/transactions/delivery-note/save-temp-batch-add-row")]
        public IActionResult SaveTempDeliveryBatchAddRow(
            int DBCH_Index,
            long DBCH_Item_Number,
            long DBCH_Warehouse_Number,
            long DBCH_DBCH_Number)
        {
            try
            {
                DN_DAO.InsertTempDeliveryBatch(
                    DBCH_Index,
                    DBCH_Item_Number,
                    DBCH_Warehouse_Number,
                    DBCH_DBCH_Number);

                return Json(new { success = true, message = "Saved Successfully" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Route("joboutward/transactions/delivery-note/delete-temp-batch-row")]
        public IActionResult DeleteTempDeliveryBatchRow(int index)
        {
            try
            {
                if (index <= 0)
                    return Json(new { success = false, message = "Invalid index" });

                DN_DAO.TempDeliveryBatchDeleteDBRow(index);

                return Json(new { success = true, message = "Row deleted successfully", index = index });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Route("joboutward/transactions/delivery-note/temp-batch-delete-change-item")]
        public IActionResult TempDeliveryBatchDeleteChangeItemDBRow(int index)
        {
            try
            {
                if (index <= 0)
                    return Json(new { success = false, message = "Invalid index" });

                DN_DAO.TempDeliveryBatchDeleteChangeItemDBRow(index);

                return Json(new { success = true, message = "Row deleted successfully", index = index });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Route("joboutward/transactions/delivery-note/temp-batch-edit-change-item")]
        public IActionResult TempDeliveryBatchEditChangeItemDBRow(long DBCH_Item_Number, long warehouse, long JODNI_Number, long JODNH_Number, int DBCH_Index)
        {
            try
            {
                DN_DAO.TempDeliveryBatchEditChangeItemDBRow(DBCH_Item_Number, warehouse, JODNI_Number, JODNH_Number, DBCH_Index);
                DN_DAO.UpdateTempBatchReservedQty();
                return Json(new { success = true, message = "Row updated successfully", index = 0 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
        #endregion

        #region freight
        [HttpGet]
        [Route("joboutward/transactions/delivery-note/get-freight-service-order")]
        public JsonResult GetFreightServiceOrder(long vendorId, long? uomNumber = null, long? fromWHNumber = null, long? toWHNumber = null)
        {
            var dt = DN_DAO
                .GetFreightServiceOrderDB(vendorId, uomNumber, fromWHNumber, toWHNumber)
                .Tables[0];

            return new JsonResult(
                dt.AsEnumerable().Select(r => new
                {
                    value = r["JOFRT_SVOH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JOFRT_SVOH_Number"]),
                    text = r["JOFRT_SVOH_ServiceOrderNo"]?.ToString() ?? "",
                    svoiNumber = r["JOFRT_SVOI_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JOFRT_SVOI_Number"])
                }).ToList(),
                CamelOpt);
        }

        [HttpGet]
        [Route("joboutward/transactions/delivery-note/check-delivered-qty-exceeded-freight")]
        public JsonResult CheckDeliveredQtyExceededFreight(long svohNumber, long? uomNumber = null, long? fromWHNumber = null, long? toWHNumber = null)
        {
            var dt = DN_DAO
                .CheckDeliveredQtyExceededFreightDB_New(svohNumber, uomNumber, fromWHNumber, toWHNumber)
                .Tables[0];

            var result = dt.AsEnumerable().Select(r => new
            {
                deliveredQty = r["DeliveredQty"] == DBNull.Value ? 0 : Convert.ToDouble(r["DeliveredQty"]),
                svoiQty = r["JOFRT_SVOI_Qty"] == DBNull.Value ? 0 : Convert.ToDouble(r["JOFRT_SVOI_Qty"]),
                isExceeded = r["IsExceeded"] != DBNull.Value && Convert.ToBoolean(r["IsExceeded"])
            }).ToList();

            return new JsonResult(result);
        }
        #endregion
    }
}