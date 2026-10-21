using ERP.DataList;
using ERP.Models;
using ERP_DAO;
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
namespace ERP.Controllers.JobOutward
{

    public class JO_ReceiptNoteController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();

        Int32? DPageNumber;
        Int32 DPageSize;

        JO_ReceiptNote_DAO RN_DAO = new JO_ReceiptNote_DAO();
        JO_ReceiptNote_DL RN_DL = new JO_ReceiptNote_DL();

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;

        private const string ViewPath = "~/Views/JobworkOutward/JO_ReceiptNote/";

        private static readonly JsonSerializerOptions CamelJson = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };

        // ---------------------------------------------------------------- helpers
        // Browser sends picked dates as UTC (e.g. 2026-09-19T18:30:00Z for 20-Sep in IST).
        // Convert back to server-local so the saved date is the date the user picked.
        private static DateTime FromBrowserUtc(DateTime d)
        {
            return d.Kind == DateTimeKind.Utc ? d.ToLocalTime() : d;
        }

        private static void FixReceiptNoteDates(JO_ReceiptNoteCreate_DTO dto)
        {
            if (dto?.Header != null)
            {
                dto.Header.JORNH_RN_Date = FromBrowserUtc(dto.Header.JORNH_RN_Date);
                dto.Header.JORNH_VendorDC_Date = FromBrowserUtc(dto.Header.JORNH_VendorDC_Date);
            }

            if (dto?.receiptNoteBatches != null)
                foreach (var b in dto.receiptNoteBatches)
                    b.JORNI_BCH_BatchDate = FromBrowserUtc(b.JORNI_BCH_BatchDate);
        }

        private static string S(DataRow r, string col)
        {
            return r.Table.Columns.Contains(col) && r[col] != DBNull.Value ? Convert.ToString(r[col]) ?? "" : "";
        }

        private static long L(DataRow r, string col)
        {
            return r.Table.Columns.Contains(col) && r[col] != DBNull.Value ? Convert.ToInt64(r[col]) : 0;
        }

        private static decimal D(DataRow r, string col)
        {
            return r.Table.Columns.Contains(col) && r[col] != DBNull.Value ? Convert.ToDecimal(r[col]) : 0;
        }

        private static double ToD(string? s)
        {
            return double.TryParse((s ?? "").Replace(",", ""), NumberStyles.Any, CultureInfo.InvariantCulture, out var v) ? v : 0;
        }

        private static bool Has(string? source, string search)
        {
            return (source ?? "").ToLower().Contains(search.ToLower());
        }

        private static List<Dictionary<string, object?>> TableToList(DataTable dt)
        {
            var list = new List<Dictionary<string, object?>>();
            foreach (DataRow r in dt.Rows)
            {
                var d = new Dictionary<string, object?>();
                foreach (DataColumn c in dt.Columns)
                    d[c.ColumnName] = r[c] == DBNull.Value ? null : r[c];
                list.Add(d);
            }
            return list;
        }

        // shared paging block (same logic as Delivery Note)
        private void SetPaging(int record, Int32? PageNumber, Int32 PSize, String? PageFilter,
                               String? SortOrder, String? Search)
        {
            DPageSize = 10;
            if (PSize != 0) DPageSize = PSize;

            if (PageFilter?.ToLower() == "pagefilter") DPageNumber = 1;

            if (PageNumber > 1)
            {
                Int32 RecordPage = (Convert.ToInt32(PageNumber) - 1) * DPageSize;

                if (record > RecordPage)
                {
                    DPageNumber = Convert.ToInt32(PageNumber);
                }
                else
                {
                    Int32 PageCount = Convert.ToInt32(Math.Ceiling(Convert.ToDouble(record) / Convert.ToDouble(DPageSize)));
                    DPageNumber = PageNumber > PageCount ? PageCount : Convert.ToInt32(PageNumber);
                }
            }
            else
            {
                DPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
            }

            if (PageFilter?.ToLower() == "pagefilter") DPageNumber = 1;

            Int32 PageCounts = Convert.ToInt32(Math.Ceiling(Convert.ToDouble(record) / Convert.ToDouble(DPageSize)));

            ViewData["CurrentSort"] = SortOrder;
            ViewData["KeySort"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;
            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewData["PageNumber"] = DPageNumber;
            ViewData["PageSize"] = DPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = record;
        }

        // ---------------------------------------------------------------- numbering
        // RN date changed on the page -> next RN number
        [HttpGet]
        [Route("joboutward/transactions/receipt-note/next-rn-number")]
        public string OnReceiptNoteNextNumber(DateTime RNDate)
        {
            JO_RN_NextNumber_DTO DTO = new JO_RN_NextNumber_DTO();
            DTO.Id = 101;
            DTO.RNDate = RNDate;
            DTO.CreatorCode = Convert.ToInt32(UserCode);

            try
            {
                DTO = new JO_RN_NextNumber_DAO().JORNNextNumberDB(DTO);
            }
            catch (Exception)
            {
                ViewBag.ErrorCode = 2;
                ViewBag.ErrorMessage = "RN Number is not configured for the selected Receipt Date.";
                return "";
            }

            return DTO.FinalRNNumber;
        }

        JORNNumber_DTO RNN_DTO = new JORNNumber_DTO();
        JORN_Numbering_DAO RNN_DAO = new JORN_Numbering_DAO();

        // after Save : move the running number (101 read, 102 insert range, 103 increment)
        void OnReceiptNoteNumberGen(Int32 RNDate)
        {
            DataSet DS1 = new DataSet();

            RNN_DTO.RNN_Date = RNDate.ToString();
            RNN_DTO.CreatorCode = Convert.ToInt32(UserCode);
            RNN_DTO.Id = 101;

            DS1 = RNN_DAO.JORN_NumberingDB(RNN_DTO);

            if (DS1.Tables[0].Rows.Count > 0)
            {
                Int32 Order = Convert.ToInt32(DS1.Tables[0].Rows[0]["JORN_NM_Method"].ToString());

                if (Order == 2)
                {
                    if (DS1.Tables[1].Rows.Count > 0)
                    {
                        // existing range -> increment
                        Int32 Number = Convert.ToInt32(DS1.Tables[1].Rows[0]["JORN_RN_StartingNumber"].ToString());

                        RNN_DTO.RNN_Number = Convert.ToInt32(DS1.Tables[1].Rows[0]["JORN_RN_NR_Number"].ToString());
                        RNN_DTO.RNN_StartingNumber = Convert.ToString(Number + 1);
                        RNN_DTO.CreatorCode = Convert.ToInt32(UserCode);
                        RNN_DTO.Id = 103;

                        RNN_DAO.JORN_NumberingDB(RNN_DTO);
                    }
                    else if (DS1.Tables[2].Rows.Count > 0)
                    {
                        // new range -> insert fresh
                        DateTime StartDate = DateTime.ParseExact(DS1.Tables[2].Rows[0]["JORN_NR_Date"].ToString(), "dd-MM-yyyy", CultureInfo.InvariantCulture);
                        DateTime EndDate = DateTime.ParseExact(DS1.Tables[2].Rows[0]["JORN_NR_EndDate"].ToString(), "dd-MM-yyyy", CultureInfo.InvariantCulture);
                        Int32 Start = Convert.ToInt32(DS1.Tables[2].Rows[0]["JORN_NR_StartingNumber"].ToString());

                        RNN_DTO.RNN_Number = Convert.ToInt32(DS1.Tables[2].Rows[0]["JORN_NR_Number"].ToString());
                        RNN_DTO.RNN_StartingNumber = Convert.ToString(Start);
                        RNN_DTO.RNN_Date = StartDate.ToString("yyyyMMdd");
                        RNN_DTO.RNN_Method = EndDate.ToString("yyyyMMdd");
                        RNN_DTO.CreatorCode = Convert.ToInt32(UserCode);
                        RNN_DTO.Id = 102;

                        RNN_DAO.JORN_NumberingDB(RNN_DTO);
                    }
                }
            }
        }

        // ---------------------------------------------------------------- lookups
        // master combos (SP Id 1 : tables 0..4 = Currency, MaterialSegregation, UoM, Warehouse, Process)
        public void GetReceiptNoteData()
        {
            JO_ReceiptNoteCreate_DTO RN_DTO = new JO_ReceiptNoteCreate_DTO();
            RN_DTO.Header.JORNH_RN_Date = DateTime.Now;
            RN_DTO.Header.RN_Id = 1;

            DataSet DS = RN_DAO.JO_ReceiptNoteDB(RN_DTO);
            ViewBag.Currency = Help.GetCat(DS.Tables[0]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[1]);
            ViewBag.UoM = Help.GetCat(DS.Tables[2]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[3]);
            ViewBag.Process = Help.GetCat(DS.Tables[4]);
        }

        [Route("joboutward/transactions/receipt-note/vendor")]
        public IActionResult SearchVendor(String? Vendor, String? RNDate)
        {
            JO_ReceiptNoteCreate_DTO RN_DTO = new JO_ReceiptNoteCreate_DTO();

            RN_DTO.Header.JORNI_Item_Code = Vendor ?? "";
            RN_DTO.Header.JORNH_RN_Date = string.IsNullOrEmpty(RNDate) ? DateTime.Now : Convert.ToDateTime(RNDate);
            RN_DTO.Header.RN_Id = 5;

            DataSet DS = RN_DAO.JO_ReceiptNoteDB(RN_DTO);
            return Json(TableToList(DS.Tables[0]));
        }

        // item search : same item list as Delivery Note (JI receipt SP, Id 2)
        [Route("joboutward/transactions/receipt-note/item")]
        public IActionResult SearchItem(String? ItemCode, String? MS)
        {
            ReceiptNote_DTO SI_DTO = new ReceiptNote_DTO();
            ReceiptNote_DAO SI_DAO = new ReceiptNote_DAO();
            ReceiptNote_DL S_DL = new ReceiptNote_DL();

            SI_DTO.JIRN_CreatorCode = Convert.ToInt64(1);
            SI_DTO.JIRNI_ITM_Code = Convert.ToString(ItemCode ?? "");
            SI_DTO.JIRNH_MS_Number = Convert.ToInt64(string.IsNullOrEmpty(MS) ? "0" : MS);
            SI_DTO.JIRN_Id = 2;

            DataSet DS = SI_DAO.JI_ReceiptNoteDB(SI_DTO);
            return Json(S_DL.ItemList(DS.Tables[0]));
        }

        // ---------------------------------------------------------------- DFS GET
        #region Default Form Setting (DFS) get
        // Create page only: loads default values on page load
        [HttpGet]
        [Route("joboutward/transactions/receipt-note-dfs/get")]
        public IActionResult GetReceiptNoteDFS()
        {
            JORN_DFS_DAO dao = new JORN_DFS_DAO();

            DataSet ds = dao.JO_ReceiptNoteDFSGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        jorN_DFS_Number = row["JORN_DFS_Number"],
                        jorN_DFS_MS_Number = row["JORN_DFS_MS_Number"],
                        jorN_DFS_JW_Vendor_Number = row["JORN_DFS_JW_Vendor_Number"],
                        jwV_JW_VendorName = row["JWV_JW_VendorName"],
                        jorN_DFS_IsFreightApplicable = row["JORN_DFS_IsFreightApplicable"],
                        jorN_DFS_Remarks = row["JORN_DFS_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }
        #endregion

        // ---------------------------------------------------------------- CREATE
        #region Receipt Note Create
        [Route("joboutward/transactions/receipt-note")]
        public IActionResult Index()
        {
            GetReceiptNoteData();
            RN_DAO.DeleteTempReceiptNoteBatch();
            ViewBag.Collapse = true;
            return View(ViewPath + "Index.cshtml");
        }

        [HttpPost]
        [Route("joboutward/transactions/receipt-note/save")]
        public IActionResult SaveReceiptNote([FromBody] JO_ReceiptNoteCreate_DTO dto)
        {
            try
            {
                if (dto == null)
                    return Json(new { success = false, message = "DTO is null" });

                if (dto.Header == null)
                    return Json(new { success = false, message = "Header is null" });

                if (dto.Items == null || dto.Items.Count == 0)
                    return Json(new { success = false, message = "Add at least one item." });

                FixReceiptNoteDates(dto);

                long RN_Number = RN_DAO.JO_ReceiptNoteCreateDB(dto);

                OnReceiptNoteNumberGen(Convert.ToInt32(dto.Header.JORNH_RN_Date.ToString("yyyyMMdd")));

                return Json(new
                {
                    success = true,
                    rnNumber = RN_Number,
                    redirectUrl = Url.Action("Index", "JO_ReceiptNote")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
        #endregion

        // ---------------------------------------------------------------- SUMMARY
        #region Receipt Note Summary
        [Route("joboutward/transactions/receipt-note-summary")]
        public IActionResult ReceiptNoteSummary(String? SortOrder, String? Search, Int32? PageNumber,
                                                Int32 PSize, String? PageFilter)
        {
            var list = RNSummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(ViewPath + "ReceiptNoteSummary.cshtml",
                PaginatedList_DTO<JO_ReceiptNoteSummary_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        [Route("joboutward/transactions/receipt-note-summary")]
        [HttpPost]
        public IActionResult ReceiptNoteSummary(String? SortOrder, String? Search, Int32? PageNumber,
                                                Int32 PSize, String? PageFilter, String? Mode, String? RN_No)
        {
            if (Mode == "View")
                return RedirectToAction("ViewNote", new { JORNH_Number = RN_No });

            if (Mode == "Edit")
                return RedirectToAction("Edit", new { JORNH_Number = RN_No });

            var list = RNSummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(ViewPath + "ReceiptNoteSummary.cshtml",
                PaginatedList_DTO<JO_ReceiptNoteSummary_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        List<JO_ReceiptNoteSummary_DTO> RNSummaryGetData(String? SortOrder, String? Search, Int32? PageNumber,
                                                         Int32 PSize, String? PageFilter)
        {
            JO_ReceiptNoteSummary_DTO RNS_DTO = new JO_ReceiptNoteSummary_DTO();
            RNS_DTO.RN_Id = 1;
            RNS_DTO.RN_CreatorCode = Convert.ToInt32(UserCode);

            DS = RN_DAO.JO_ReceiptNoteSummaryDB(RNS_DTO);
            var RNS_List = RN_DL.RNSummaryList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder)) SortOrder = "Title_desc";

            var Key = RNS_List.OrderByDescending(Cs => Cs.JORNH_Number).AsEnumerable();

            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>
                    Has(K.JORNH_RN_Date.ToString(), Search) ||
                    Has(K.JORNH_RN_No, Search) ||
                    Has(K.JORNH_VendorDC_No, Search) ||
                    Has(K.JWV_JW_VendorName, Search) ||
                    Has(K.JVG_JW_VendorGroup, Search) ||
                    Has(K.JVC_JW_VendorCategory, Search) ||
                    Has(K.CurrencyCode, Search) ||
                    Has(K.WarehouseCode, Search) ||
                    Has(K.Segregation, Search) ||
                    Has(K.NoOfLineItems.ToString(), Search) ||
                    Has(K.Qty, Search) ||
                    Has(K.JW_SO_No, Search) ||
                    Has(K.Freight_SO_No, Search)
                ).OrderByDescending(Cs => Cs.JORNH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc": Key = Key.OrderByDescending(K => K.JORNH_RN_Date); break;
                case "Title": Key = Key.OrderBy(K => K.JORNH_RN_Date); break;
                default: Key = Key.OrderByDescending(K => K.JORNH_Number); break;
            }

            var result = Key.ToList();

            SetPaging(result.Count, PageNumber, PSize, PageFilter, SortOrder, Search);

            ViewBag.SumOfItem = result.Sum(item => Convert.ToDouble(item.NoOfLineItems));
            ViewBag.SumOfQty = result.Sum(item => ToD(item.Qty));
            ViewBag.SumOfQtyKgs = result.Sum(item => ToD(item.Qty_Kgs));
            ViewBag.SumOfAmount = result.Sum(item => item.Amount);

            return result;
        }
        #endregion

        // ---------------------------------------------------------------- DETAILED
        #region Receipt Note Detailed
        [Route("joboutward/transactions/receipt-note-detailed")]
        public IActionResult ReceiptNoteDetailed(String? SortOrder, String? Search, Int32? PageNumber,
                                                 Int32 PSize, String? PageFilter)
        {
            var list = RNDetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(ViewPath + "ReceiptNoteDetailed.cshtml",
                PaginatedList_DTO<JO_ReceiptNoteDetailed_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        [Route("joboutward/transactions/receipt-note-detailed")]
        [HttpPost]
        public IActionResult ReceiptNoteDetailed(String? SortOrder, String? Search, Int32? PageNumber,
                                                 Int32 PSize, String? PageFilter, String? Mode, String? RN_No)
        {
            if (Mode == "View")
                return RedirectToAction("ViewNote", new { JORNH_Number = RN_No });

            if (Mode == "Edit")
                return RedirectToAction("Edit", new { JORNH_Number = RN_No });

            var list = RNDetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(ViewPath + "ReceiptNoteDetailed.cshtml",
                PaginatedList_DTO<JO_ReceiptNoteDetailed_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        List<JO_ReceiptNoteDetailed_DTO> RNDetailedGetData(String? SortOrder, String? Search, Int32? PageNumber,
                                                           Int32 PSize, String? PageFilter)
        {
            JO_ReceiptNoteSummary_DTO RNS_DTO = new JO_ReceiptNoteSummary_DTO();
            RNS_DTO.RN_Id = 2;
            RNS_DTO.RN_CreatorCode = Convert.ToInt32(UserCode);

            DS = RN_DAO.JO_ReceiptNoteSummaryDB(RNS_DTO);
            var RND_List = RN_DL.RNDetailedList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder)) SortOrder = "Title_desc";

            var Key = RND_List.OrderByDescending(Cs => Cs.JORNH_Number).AsEnumerable();

            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>
                    Has(K.JORNH_RN_Date.ToString(), Search) ||
                    Has(K.JORNH_RN_No, Search) ||
                    Has(K.JORNH_VendorDC_No, Search) ||
                    Has(K.JWV_JW_VendorName, Search) ||
                    Has(K.CurrencyCode, Search) ||
                    Has(K.WarehouseCode, Search) ||
                    Has(K.ItemCode, Search) ||
                    Has(K.Process, Search) ||
                    Has(K.JW_SO_No, Search) ||
                    Has(K.Freight_SO_No, Search)
                ).OrderByDescending(Cs => Cs.JORNH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc": Key = Key.OrderByDescending(K => K.JORNH_RN_Date); break;
                case "Title": Key = Key.OrderBy(K => K.JORNH_RN_Date); break;
                default: Key = Key.OrderByDescending(K => K.JORNH_Number); break;
            }

            var result = Key.ToList();

            SetPaging(result.Count, PageNumber, PSize, PageFilter, SortOrder, Search);
            return result;
        }
        #endregion

        // ---------------------------------------------------------------- EDIT / VIEW
        #region Receipt Note Edit / View
        [Route("joboutward/transactions/receipt-note/edit")]
        public IActionResult Edit(long JORNH_Number)
        {
            return LoadReceiptNotePage(JORNH_Number, false);
        }

        // Read-only page : same page and same data as Edit, nothing is written to the temp batch table
        [HttpGet]
        [Route("joboutward/transactions/receipt-note/view")]
        public IActionResult ViewNote(long JORNH_Number)
        {
            return LoadReceiptNotePage(JORNH_Number, true);
        }

        private IActionResult LoadReceiptNotePage(long JORNH_Number, bool isViewMode)
        {
            GetReceiptNoteData();

            DataSet DS = RN_DAO.JO_ReceiptNoteEditDB(JORNH_Number);
            var list = RN_DL.ReceiptNoteViewList(DS);

            JO_ReceiptNoteCreate_DTO dto = list.FirstOrDefault() ?? new JO_ReceiptNoteCreate_DTO();

            if (dto.Items.Count > 0 && !isViewMode)
            {
                // first item's number : the temp-copy SP loads all batches of this receipt from it
                RN_DAO.InsertEditBatchToTempDB(dto.Items[0].JORNI_Number);
            }

            ViewBag.Collapse = true;
            ViewBag.IsViewMode = isViewMode;
            return View(ViewPath + "Edit.cshtml", dto);
        }

        [HttpPost]
        [Route("joboutward/transactions/receipt-note/update")]
        public IActionResult UpdateReceiptNote([FromBody] JO_ReceiptNoteCreate_DTO dto)
        {
            try
            {
                if (dto == null || dto.Header == null)
                    return Json(new { success = false, message = "Header is null" });

                FixReceiptNoteDates(dto);

                RN_DAO.JO_ReceiptNoteUpdateDB(dto);
                RN_DAO.DeleteTempReceiptNoteBatch();

                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action("ReceiptNoteSummary", "JO_ReceiptNote")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Route("joboutward/transactions/receipt-note/delete-removed-rows")]
        public IActionResult DeleteRemovedRows([FromBody] List<JO_ReceiptNoteDeletedRow_DTO> deletedRows)
        {
            try
            {
                RN_DAO.DeleteRemovedRowsDB(deletedRows);
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
        #endregion

        // ---------------------------------------------------------------- BATCH
        #region Batch popup (stock batches, same as Delivery Note)
        private static object BatchRow(DataTable dt, DataRow r)
        {
            return new
            {
                LineBatch_Number = L(r, "LineBatch_Number"),
                FromWarehouse = L(r, "FromWarehouse"),
                BatchDate = r.Table.Columns.Contains("BatchDate") && r["BatchDate"] != DBNull.Value
                    ? Convert.ToDateTime(r["BatchDate"]).ToString("dd MMM yyyy") : "",
                BatchNo = S(r, "BatchNo"),
                BatchQty = D(r, "BatchQty"),
                ReservedQty = D(r, "ReservedQty"),
                AvailableQty = D(r, "AvailableQty"),
                BatchUnitPrice = D(r, "BatchUnitPrice"),
                BatchValue = D(r, "BatchValue"),
                ReceivedQty = r.Table.Columns.Contains("ReceivedQty") ? D(r, "ReceivedQty") : D(r, "DeliveredQty"),
                RefBatch_Number = L(r, "RefBatch_Number"),
                UsedQty = r.Table.Columns.Contains("UsedQty") ? D(r, "UsedQty") : 0,
                WareHouseCode = S(r, "WarehouseCode")
            };
        }

        [HttpGet]
        [Route("joboutward/transactions/receipt-note/get-batch-details")]
        public JsonResult GetBatchDetails(long FromWarehouse, long LineItem_Number, int ItemGridIndex)
        {
            DataTable dt = RN_DAO.GetBatchDetailsDB(FromWarehouse, LineItem_Number, ItemGridIndex).Tables[0];
            var data = dt.AsEnumerable().Select(r => BatchRow(dt, r)).ToList();
            return new JsonResult(data, CamelJson);
        }

        [HttpGet]
        [Route("joboutward/transactions/receipt-note/get-other-batch-details")]
        public JsonResult GetOtherBatchDetails(long FromWarehouse, long LineItem_Number, int ItemGridIndex)
        {
            DataTable dt = RN_DAO.GetOtherBatchDetailsDB(FromWarehouse, LineItem_Number, ItemGridIndex).Tables[0];
            var data = dt.AsEnumerable().Select(r => BatchRow(dt, r)).ToList();
            return new JsonResult(data, CamelJson);
        }

        // View page : batches saved on one item row (read-only)
        [HttpGet]
        [Route("joboutward/transactions/receipt-note/get-saved-batch-details")]
        public JsonResult GetBatchDetailsViewDB(long FromWarehouse, long JORNI_Number)
        {
            DataTable dt = RN_DAO.GetBatchDetailsViewDB(FromWarehouse, JORNI_Number).Tables[0];
            var data = dt.AsEnumerable().Select(r => new
            {
                BatchDate = r.Table.Columns.Contains("BatchDate") && r["BatchDate"] != DBNull.Value
                    ? Convert.ToDateTime(r["BatchDate"]).ToString("dd MMM yyyy") : "",
                BatchNo = S(r, "BatchNo"),
                BatchQty = D(r, "BatchQty"),
                UsedQty = D(r, "UsedQty"),
                BatchUnitPrice = D(r, "BatchUnitPrice"),
                BatchValue = D(r, "BatchValue"),
                WareHouseCode = S(r, "WarehouseCode")
            }).ToList();
            return new JsonResult(data, CamelJson);
        }

        // popup Save : one grid row's batch rows
        [HttpPost]
        [Route("joboutward/transactions/receipt-note/save-temp-batch")]
        public IActionResult SaveTempReceiptBatch([FromBody] List<TempJO_ReceiptBatch_DTO> dtoList)
        {
            try
            {
                if (dtoList == null || dtoList.Count == 0)
                    return Json(new { success = false, message = "DTO list is empty" });

                foreach (var d in dtoList)
                    d.DBCH_Date = FromBrowserUtc(d.DBCH_Date);

                RN_DAO.TempReceiptBatchSaveDB(dtoList);

                return Json(new { success = true, message = "Batch Saved Successfully", count = dtoList.Count });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // Create page : grid row removed
        [HttpPost]
        [Route("joboutward/transactions/receipt-note/delete-temp-batch-row")]
        public IActionResult DeleteTempReceiptBatchRow(int index)
        {
            try
            {
                if (index <= 0)
                    return Json(new { success = false, message = "Invalid index" });

                RN_DAO.TempReceiptBatchDeleteDBRow(index);
                return Json(new { success = true, message = "Row deleted successfully", index = index });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // Item / Warehouse changed on a grid row -> its batch rows are cleared
        [HttpPost]
        [Route("joboutward/transactions/receipt-note/temp-batch-change-item")]
        public IActionResult TempReceiptBatchEditChangeItemDBRow(long JORNI_Number, long JORNH_Number, int DBCH_Index)
        {
            try
            {
                RN_DAO.TempReceiptBatchEditChangeItemDBRow(JORNI_Number, JORNH_Number, DBCH_Index);
                return Json(new { success = true, message = "Batch cleared", index = 0 });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("joboutward/transactions/receipt-note/validate-batch-details")]
        public JsonResult ValidateBatchDetails(long JORNH_Number)
        {
            string validationMessage = RN_DAO.ValidateBatchDetails(JORNH_Number);

            var result = new
            {
                Status = string.IsNullOrEmpty(validationMessage),
                Message = validationMessage
            };
            return new JsonResult(result, CamelJson);
        }

        [HttpGet]
        [Route("joboutward/transactions/receipt-note/validate-amended-batch-qty")]
        public JsonResult Validate_Amended_BatchQty(long JORNH_Number)
        {
            var data = RN_DAO.Validate_Amended_BatchQty(JORNH_Number);
            return new JsonResult(new { status = true, data = data }, CamelJson);
        }
        #endregion

        // ---------------------------------------------------------------- SERVICE ORDERS
        #region JW Invoice SO / Freight SO
        [HttpGet]
        [Route("joboutward/transactions/receipt-note/get-service-order")]
        public JsonResult GetServiceOrder(long vendorId, long? prsNumber = null, long? itemNumber = null,
                                          long? uomNumber = null, long excludeJORNH = 0)
        {
            var dt = RN_DAO.GetServiceOrderDB(vendorId, prsNumber, itemNumber, uomNumber, excludeJORNH).Tables[0];

            return new JsonResult(dt.AsEnumerable().Select(r => new
            {
                value = L(r, "JOJWI_SVOH_Number"),
                text = S(r, "JOJWI_SVOH_ServiceOrderNo"),
                jisvoiNumber = L(r, "JOJWI_SVOI_Number")
            }).ToList(), CamelJson);
        }

        [HttpGet]
        [Route("joboutward/transactions/receipt-note/get-freight-service-order")]
        public JsonResult GetFreightServiceOrder(long vendorId, long? uomNumber = null, long? fromWHNumber = null,
                                                 long? toWHNumber = null, long excludeJORNH = 0)
        {
            var dt = RN_DAO.GetFreightServiceOrderDB(vendorId, uomNumber, fromWHNumber, toWHNumber, excludeJORNH).Tables[0];

            return new JsonResult(dt.AsEnumerable().Select(r => new
            {
                value = L(r, "JOFRT_SVOH_Number"),
                text = S(r, "JOFRT_SVOH_ServiceOrderNo"),
                jisvoiNumber = L(r, "JOFRT_SVOI_Number")
            }).ToList(), CamelJson);
        }

        [HttpGet]
        [Route("joboutward/transactions/receipt-note/check-received-qty-exceeded")]
        public JsonResult CheckReceivedQtyExceeded(long jisvohNumber, long? prsNumber = null, long? itemNumber = null,
                                                   long? uomNumber = null, long excludeJORNH = 0)
        {
            var dt = RN_DAO.CheckReceivedQtyExceededJWIDB(jisvohNumber, prsNumber, itemNumber, uomNumber, excludeJORNH).Tables[0];

            return new JsonResult(dt.AsEnumerable().Select(r => new
            {
                receivedQty = D(r, "ReceivedQty"),
                jisvoiQty = D(r, "SO_Qty"),
                isExceeded = r["IsExceeded"] != DBNull.Value && Convert.ToBoolean(r["IsExceeded"])
            }).ToList());
        }

        [HttpGet]
        [Route("joboutward/transactions/receipt-note/check-received-qty-exceeded-freight")]
        public JsonResult CheckReceivedQtyExceededFreight(long jisvohNumber, long? uomNumber = null,
                                                          long? fromWHNumber = null, long? toWHNumber = null,
                                                          long excludeJORNH = 0)
        {
            var dt = RN_DAO.CheckReceivedQtyExceededFreightDB(jisvohNumber, uomNumber, fromWHNumber, toWHNumber, excludeJORNH).Tables[0];

            return new JsonResult(dt.AsEnumerable().Select(r => new
            {
                receivedQty = D(r, "ReceivedQty"),
                jisvoiQty = D(r, "SO_Qty"),
                isExceeded = r["IsExceeded"] != DBNull.Value && Convert.ToBoolean(r["IsExceeded"])
            }).ToList());
        }
        #endregion
    }

}
