using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DAO.ProductionTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobInwardTransaction;
using ERP_DTO.ProductionTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;

namespace ERP.Controllers.Production
{
    public class WarehouseTransferController : Controller
    {
        Help Help = new Help();
        WarehouseTransfer_DAO DAO = new WarehouseTransfer_DAO();
        WarehouseTransfer_DL DL = new WarehouseTransfer_DL();

        Int32? CPageNumber;
        Int32 CPageSize;

        const decimal Tol = 0.0005m;
        const string NotConfigured = "Warehouse Transfer Journal Number is not configured for the selected date.";

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;
        int CreatorCode => Convert.ToInt32(UserCode);

        const string ViewPath = "~/Views/Production/WarehouseTransfer/";

        #region Create page

        [Route("production/transactions/warehouse-transfer")]
        public IActionResult Index()
        {
            DAO.TempBatchClearUserDB(CreatorCode);
            LoadMasters();

            var dto = new WarehouseTransferCreate_DTO();
            dto.Header ??= new WarehouseTransferHeader_DTO();
            dto.Header.WHTH_Date = DateTime.Today;

            ViewBag.Collapse = true;
            return View(ViewPath + "Index.cshtml", dto);
        }

        // WHT_SP Id 1 : table 0 = UoM, table 1 = Warehouse
        void LoadMasters()
        {
            DataSet ds = DAO.WarehouseTransferDB(1, DateTime.Today);

            ViewBag.UoM = Help.GetCat(Two(ds.Tables[0]));
            ViewBag.Warehouse = Help.GetCat(Two(ds.Tables[1]));
            ViewBag.MaterialSegregation = Help.GetCat(Two(ds.Tables[2]));

            // extra data for JS (default UoM, decimals)
            ViewBag.UoMJson = JsonSerializer.Serialize(DL.UoMList(ds).Select(u => new
            {
                number = u.UnitNumber,
                code = u.UnitCode,
                decimals = u.DecimalPlaces
            }));

            ViewBag.WarehouseJson = JsonSerializer.Serialize(DL.WarehouseList(ds).Select(w => new
            {
                number = w.WarehouseNumber,
                code = w.WarehouseCode
            }));
        }

        static DataTable Two(DataTable dt)
            => new DataView(dt).ToTable(false, dt.Columns[0].ColumnName, dt.Columns[1].ColumnName);

        // item search (Receipt Note item search, filtered by the selected Material Segregation)
        [Route("production/transactions/warehouse-transfer/item")]
        public IActionResult SaleItem(String? ItemCode, String? MS)
        {
            ReceiptNote_DTO SI_DTO = new ReceiptNote_DTO();
            ReceiptNote_DAO SI_DAO = new ReceiptNote_DAO();
            ReceiptNote_DL S_DL = new ReceiptNote_DL();

            SI_DTO.JIRN_CreatorCode = Convert.ToInt64(CreatorCode);
            SI_DTO.JIRNI_ITM_Code = Convert.ToString(ItemCode ?? "");
            SI_DTO.JIRNH_MS_Number = Convert.ToInt64(string.IsNullOrEmpty(MS) ? "0" : MS);
            SI_DTO.JIRN_Id = 2;

            DataSet DS = SI_DAO.JI_ReceiptNoteDB(SI_DTO);
            return Json(S_DL.ItemList(DS.Tables[0]));
        }

        // next journal number for the date
        [HttpGet]
        [Route("production/transactions/warehouse-transfer/next-number")]
        public IActionResult NextNumber(DateTime WHTDate)
        {
            try
            {
                DataSet ds = DAO.WarehouseTransferDB(0, WHTDate);

                if (ds.Tables.Count < 2 || ds.Tables[0].Rows.Count == 0 || ds.Tables[1].Rows.Count == 0)
                    return Json(new { success = false, message = NotConfigured });

                return Json(new { success = true, manual = false, number = DAO.WarehouseTransferNextNumberDB(WHTDate) });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = NotConfigured });
            }
        }

        #endregion

        #region Save

        [HttpPost]
        [Route("production/transactions/warehouse-transfer/save")]
        public IActionResult Save([FromBody] WarehouseTransferCreate_DTO dto)
        {
            try
            {
                string err = Validate(dto);
                if (err != null)
                    return Json(new { success = false, message = err });

                long number = DAO.WarehouseTransferCreateDB(dto, CreatorCode);

                return Json(new
                {
                    success = true,
                    number = number,
                    message = "Warehouse Transfer saved successfully",
                    redirectUrl = Url.Action("Index", "WarehouseTransfer")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        string Validate(WarehouseTransferCreate_DTO dto)
        {
            if (dto == null || dto.Header == null) return "Header is null";

            var h = dto.Header;
            if (string.IsNullOrWhiteSpace(h.WHTH_JournalNo)) return "Journal No is required";
            if (h.WHTH_Date == DateTime.MinValue) return "Date is required";
            if (h.WHTH_MS_Number == 0) return "Material Segregation is required";

            dto.Items ??= new();
            dto.Batches ??= new();

            if (dto.Items.Count == 0) return "At least one item row is required";

            for (int i = 0; i < dto.Items.Count; i++)
            {
                var x = dto.Items[i];
                string r = "Row " + (i + 1) + ": ";

                if (x.WHTI_Item_Number == 0) return r + "Item is required";
                if (x.WHTI_From_WH_Number == 0) return r + "From Warehouse is required";
                if (x.WHTI_To_WH_Number == 0) return r + "To Warehouse is required";
                if (x.WHTI_UoM_Number == 0) return r + "UoM is required";
                if (x.WHTI_From_WH_Number == x.WHTI_To_WH_Number) return r + "From Warehouse and To Warehouse should not be same";
                if (x.WHTI_Qty <= 0) return r + "Qty must be above zero";

                var rowBatches = dto.Batches.Where(k => k.WHTI_BCH_WHTI_Number == i).ToList();
                decimal b = rowBatches.Sum(k => k.WHTI_BCH_BatchQty);
                if (Math.Abs(b - x.WHTI_Qty) > Tol)
                    return r + "batch qty (" + b.ToString("0.###") + ") must match item qty (" + x.WHTI_Qty.ToString("0.###") + ")";

                foreach (var k in rowBatches)
                {
                    if (k.WHTI_BCH_BatchQty <= 0) return r + "batch qty must be above zero";
                    if (k.WHTI_BCH_RefBatch_Number == 0) return r + "source batch is missing";
                    if (k.WHTI_BCH_FWH_Number != x.WHTI_From_WH_Number) return r + "batch From Warehouse must match item From Warehouse";
                    if (k.WHTI_BCH_TWH_Number != x.WHTI_To_WH_Number) return r + "batch To Warehouse must match item To Warehouse";
                }
            }

            foreach (var k in dto.Batches)
                if (k.WHTI_BCH_WHTI_Number < 0 || k.WHTI_BCH_WHTI_Number >= dto.Items.Count)
                    return "Batch is linked to an invalid item row";

            return null;
        }

        #endregion

        #region Batch popup + temp reservation

        // OtherWarehouses = false : From Warehouse tab (qty entry), true : Other Warehouses tab (view only)
        [HttpGet]
        [Route("production/transactions/warehouse-transfer/batch")]
        public JsonResult GetBatchDetails(long ItemNumber, long Warehouse, int ItemGridIndex, bool OtherWarehouses = false)
        {
            DataSet ds = DAO.GetBatchDetailsDB(ItemNumber, Warehouse, ItemGridIndex, CreatorCode, OtherWarehouses);
            var data = DL.BatchList(ds).Select(b => new
            {
                b.LineBatch_Number,
                b.FromWarehouse,
                BatchDate = b.BatchDate == DateTime.MinValue ? "" : b.BatchDate.ToString("dd MMM yyyy"),
                b.BatchNo,
                b.BatchQty,
                b.ReservedQty,
                b.DeliveredQty,
                b.AvailableQty,
                b.BatchUnitPrice,
                b.BatchValue,
                b.WarehouseCode,
                b.ItemStatus
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
        }

        [HttpPost]
        [Route("production/transactions/warehouse-transfer/temp-save")]
        public IActionResult SaveTempBatch([FromBody] List<WarehouseTransferTempBatch_DTO> list)
        {
            try
            {
                if (list == null || list.Count == 0)
                    return Json(new { success = false, message = "Batch list is empty" });

                DAO.TempBatchSaveDB(list, CreatorCode);
                return Json(new { success = true, message = "Batch Saved Successfully", count = list.Count });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // item row removed / item or warehouse changed : release its reserved batches
        [HttpPost]
        [Route("production/transactions/warehouse-transfer/temp-clear-rows")]
        public IActionResult ClearTempRows([FromBody] List<WarehouseTransferDeletedRowInfo_DTO> rows)
        {
            try
            {
                var idx = (rows ?? new()).Select(r => r.ItemGridindex).ToList();
                DAO.TempBatchClearRowsDB(idx, CreatorCode);
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        // page cancel / leave : release everything of this user
        [HttpPost]
        [Route("production/transactions/warehouse-transfer/temp-clear")]
        public IActionResult ClearTempUser()
        {
            try
            {
                DAO.TempBatchClearUserDB(CreatorCode);
                return Json(new { success = true });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        #endregion

        #region Summary

        [AcceptVerbs("GET", "POST")]
        [Route("production/transactions/warehouse-transfer-summary")]
        public IActionResult WarehouseTransferSummary(string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter)
        {
            var list = DL.SummaryList(DAO.WarehouseTransferSummaryDB());

            if (string.IsNullOrEmpty(SortOrder)) SortOrder = "Default";
            ViewData["CurrentSort"] = SortOrder;
            ViewData["CurrentFilter"] = Search;

            IEnumerable<WarehouseTransferSummary_DTO> Key = list;

            if (!string.IsNullOrEmpty(Search))
            {
                string s = Search.ToLower();
                Key = Key.Where(x =>
                               (x.WHTH_JournalNo ?? "").ToLower().Contains(s) ||
                    (x.WHTH_Date ?? "").ToLower().Contains(s) ||
                    (x.Segregation ?? "").ToLower().Contains(s));
            }

            if (SortOrder == "Title")
                Key = Key.OrderBy(x => ParseDate(x.WHTH_Date)).ThenBy(x => x.WHTH_Number);
            else if (SortOrder == "Title_desc")
                Key = Key.OrderByDescending(x => ParseDate(x.WHTH_Date)).ThenByDescending(x => x.WHTH_Number);

            var result = ApplyPaging(Key, PageNumber, PSize);

            ViewBag.Collapse = true;
            return View(ViewPath + "WarehouseTransferSummary.cshtml",
                PaginatedList_DTO<WarehouseTransferSummary_DTO>.CreateAsync(result, CPageNumber ?? 1, CPageSize));
        }

        #endregion

        #region Detailed

        // head columns are filled only on the first line of a journal, so search / sort work on the journal (group) head
        [AcceptVerbs("GET", "POST")]
        [Route("production/transactions/warehouse-transfer-detailed")]
        public IActionResult WarehouseTransferDetailed(string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter)
        {
            var list = DL.DetailedList(DAO.WarehouseTransferDetailedDB());

            if (string.IsNullOrEmpty(SortOrder)) SortOrder = "Default";
            ViewData["CurrentSort"] = SortOrder;
            ViewData["CurrentFilter"] = Search;

            var heads = list.Where(x => x.WHTH_Number.HasValue)
                            .GroupBy(x => x.WHTH_Number!.Value)
                            .ToDictionary(g => g.Key, g => g.First());

            long cur = 0;
            var rows = list.Select((x, i) =>
            {
                if (x.WHTH_Number.HasValue) cur = x.WHTH_Number.Value;
                return new { Row = x, Head = cur, Idx = i };
            }).ToList();

            var q = rows.AsEnumerable();

            if (!string.IsNullOrEmpty(Search))
            {
                string s = Search.ToLower();
                q = q.Where(t =>
                {
                    if (!heads.TryGetValue(t.Head, out var h)) return false;
                    return (h.WHTH_JournalNo ?? "").ToLower().Contains(s) ||
               (h.WHTH_Date ?? "").ToLower().Contains(s) ||
               (h.Segregation ?? "").ToLower().Contains(s);
                });
            }

            if (SortOrder == "Title")
                q = q.OrderBy(t => ParseDate(heads.ContainsKey(t.Head) ? heads[t.Head].WHTH_Date : null)).ThenBy(t => t.Head).ThenBy(t => t.Idx);
            else if (SortOrder == "Title_desc")
                q = q.OrderByDescending(t => ParseDate(heads.ContainsKey(t.Head) ? heads[t.Head].WHTH_Date : null)).ThenByDescending(t => t.Head).ThenBy(t => t.Idx);

            // journal head repeated on every line (same as Delivery Note Detailed)
            ViewBag.SumOfQty = q.Sum(t => t.Row.WHTI_Qty ?? 0);

            var result = ApplyPaging(q.Select(t =>
            {
                if (heads.TryGetValue(t.Head, out var h))
                {
                    t.Row.WHTH_Number ??= h.WHTH_Number;
                    t.Row.WHTH_JournalNo ??= h.WHTH_JournalNo;
                    t.Row.WHTH_Date ??= h.WHTH_Date;
                }
                return t.Row;
            }), PageNumber, PSize);

            ViewBag.Collapse = true;
            return View(ViewPath + "WarehouseTransferDetailed.cshtml",
                PaginatedList_DTO<WarehouseTransferDetailed_DTO>.CreateAsync(result, CPageNumber ?? 1, CPageSize));
        }

        #endregion

        #region paging helpers

        static DateTime ParseDate(string? s)
            => DateTime.TryParse(s, out var d) ? d : DateTime.MinValue;

        List<T> ApplyPaging<T>(IEnumerable<T> Key, int? PageNumber, int PSize)
        {
            CPageSize = PSize != 0 ? PSize : 10;

            var all = Key.ToList();
            int Record = all.Count;

            if (PageNumber > 1)
            {
                int RecordPage = (Convert.ToInt32(PageNumber) - 1) * CPageSize;

                if (Record > RecordPage)
                    CPageNumber = Convert.ToInt32(PageNumber);
                else
                {
                    int PageCount = Convert.ToInt32(Math.Ceiling(Convert.ToDouble(Record) / CPageSize));
                    CPageNumber = PageNumber > PageCount ? PageCount : Convert.ToInt32(PageNumber);
                }
            }
            else
            {
                CPageNumber = Convert.ToInt32(PageNumber) == 0 ? 1 : Convert.ToInt32(PageNumber);
            }

            int PageCounts = Convert.ToInt32(Math.Ceiling(Convert.ToDouble(Record) / CPageSize));

            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewData["PageNumber"] = CPageNumber;
            ViewData["PageSize"] = CPageSize;
            ViewData["PageCount"] = PageCounts;
            ViewData["TotalSize"] = Record;

            return all;
        }

        #endregion
    }
}