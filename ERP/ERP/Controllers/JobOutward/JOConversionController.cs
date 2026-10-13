using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobInwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;

namespace ERP.Controllers.JobOutward
{
    public class JOConversionController : Controller
    {
        Help Help = new Help();
        JO_Conversion_DAO DAO = new JO_Conversion_DAO();
        JO_Conversion_DL DL = new JO_Conversion_DL();

        Int32? CPageNumber;
        Int32 CPageSize;

        const decimal Tol = 0.0005m;
        const string NotConfigured = "Conversion Journal Number is not configured for the selected date.";

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;
        int CreatorCode => Convert.ToInt32(UserCode);

        #region Default Form Setting (DFS) get
        // Create page only: loads default values on page load
        [HttpGet]
        [Route("joboutward/transactions/conversion-dfs/get")]
        public IActionResult GetConversionDFS()
        {
            JOCNV_DFS_DAO dao = new JOCNV_DFS_DAO();

            DataSet ds = dao.JO_ConversionDFSGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        jocnV_DFS_Number = row["JOCNV_DFS_Number"],
                        jocnV_DFS_MS_Number = row["JOCNV_DFS_MS_Number"],
                        jocnV_DFS_JSFT_Number = row["JOCNV_DFS_JSFT_Number"],
                        jocnV_DFS_JPRS_Number = row["JOCNV_DFS_JPRS_Number"],
                        jocnV_DFS_JWWC_Number = row["JOCNV_DFS_JWWC_Number"]
                    }
                });
            }

            return Json(new { success = false });
        }
        #endregion

        #region Create page

        [Route("joboutward/transactions/conversion")]
        public IActionResult Index()
        {
            DAO.TempBatchClearUserDB(CreatorCode);
            LoadMasters();

            var dto = new JOConversionCreate_DTO();
            dto.Header.JOCNVH_Date = DateTime.Today;

            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JO_Conversion/Index.cshtml", dto);
        }

        // JO_Conversion_SP Id 1 : 0 Segregation, 1 UoM, 2 Warehouse, 3 Process, 4 Shift, 5 Work Centre
        void LoadMasters()
        {
            DataSet ds = DAO.JOConversionDB(1, DateTime.Today);

            ViewBag.MaterialSegregation = Help.GetCat(Two(ds.Tables[0]));
            ViewBag.UoM = Help.GetCat(Two(ds.Tables[1]));
            ViewBag.Warehouse = Help.GetCat(Two(ds.Tables[2]));
            ViewBag.Process = Help.GetCat(Two(ds.Tables[3]));
            ViewBag.Shift = Help.GetCat(Two(ds.Tables[4]));
            ViewBag.WorkCentre = Help.GetCat(Two(ds.Tables[5]));

            // extra data for JS (work centre filter by process, default UoM / warehouse, decimals)
            ViewBag.UoMJson = JsonSerializer.Serialize(ds.Tables[1].AsEnumerable().Select(r => new
            {
                number = L(r, "UnitNumber"),
                code = Convert.ToString(r["UnitCode"]),
                decimals = r["DecimalPlaces"] == DBNull.Value ? 0 : Convert.ToInt32(r["DecimalPlaces"])
            }));

            ViewBag.ProcessJson = JsonSerializer.Serialize(ds.Tables[3].AsEnumerable().Select(r => new
            {
                number = L(r, "JPRS_Number"),
                name = Convert.ToString(r["JPRS_ProcessName"]),
                consUoM = L(r, "JPRS_Cons_UoM_Number"),
                prodUoM = L(r, "JPRS_Prod_UoM_Number"),
                scrapUoM = L(r, "JPRS_Scrap_UoM_Number")
            }));

            ViewBag.WorkCentreJson = JsonSerializer.Serialize(ds.Tables[5].AsEnumerable().Select(r => new
            {
                number = L(r, "JWWC_Number"),
                name = Convert.ToString(r["JWWC_JW_WorkCentre"]),
                processNumber = L(r, "JWWC_JPRS_Number"),
                warehouseNumber = L(r, "JWWC_WH_Number")
            }));
        }

        static DataTable Two(DataTable dt)
            => new DataView(dt).ToTable(false, dt.Columns[0].ColumnName, dt.Columns[1].ColumnName);

        static long? L(DataRow r, string c)
            => r[c] == DBNull.Value ? (long?)null : Convert.ToInt64(r[c]);

        // item search (same Receipt Note item search as the old Conversion page)
        [Route("joboutward/transactions/conversion/item")]
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
        [Route("joboutward/transactions/conversion/next-number")]
        public IActionResult NextNumber(DateTime CNVDate)
        {
            try
            {
                DataSet ds = DAO.JOConversionDB(0, CNVDate);

                if (ds.Tables.Count < 2 || ds.Tables[0].Rows.Count == 0 || ds.Tables[1].Rows.Count == 0)
                    return Json(new { success = false, message = NotConfigured });

                // method 2 = automatic, others = manual (same as old)
                int method = Convert.ToInt32(ds.Tables[0].Rows[0]["JOCN_Method"]);
                method =2;
                if (method != 2)
                    return Json(new { success = true, manual = true, number = "" });

                return Json(new { success = true, manual = false, number = DAO.JOConversionNextNumberDB(CNVDate) });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = NotConfigured });
            }
        }

        #endregion

        #region Save

        [HttpPost]
        [Route("joboutward/transactions/conversion/save")]
        public IActionResult Save([FromBody] JOConversionCreate_DTO dto)
        {
            try
            {
                string err = Validate(dto);
                if (err != null)
                    return Json(new { success = false, message = err });

                long number = DAO.JOConversionCreateDB(dto, CreatorCode);

                return Json(new
                {
                    success = true,
                    number = number,
                    message = "Conversion saved successfully",
                    redirectUrl = Url.Action("Index", "JOConversion")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        string Validate(JOConversionCreate_DTO dto)
        {
            if (dto == null || dto.Header == null) return "Header is null";

            var h = dto.Header;
            if (string.IsNullOrWhiteSpace(h.JOCNVH_JournalNo)) return "Journal No is required";
            if (h.JOCNVH_MS_Number == 0) return "Material Segregation is required";
            if (h.JOCNVH_JSFT_Number == 0) return "Shift is required";
            if (h.JOCNVH_JPRS_Number == 0) return "Process is required";
            if (h.JOCNVH_JWWC_Number == 0) return "Work Centre is required";

            dto.Items ??= new();
            dto.ConsBatches ??= new();
            dto.Items_Production ??= new();
            dto.ItemBatch_Production ??= new();
            dto.Items_Scrap ??= new();
            dto.ItemBatch_Scrap ??= new();

            // ---- consumption ----
            if (dto.Items.Count == 0) return "Consumption item, at least one row required";

            for (int i = 0; i < dto.Items.Count; i++)
            {
                var x = dto.Items[i];
                if (x.JOCNVC_Item_Number == 0 || x.JOCNVC_WH_Number == 0 || x.JOCNVC_UoM_Number == 0)
                    return "Consumption row " + (i + 1) + ": Item / Warehouse / UoM is required";
                if (x.JOCNVC_ConsQty <= 0)
                    return "Consumption row " + (i + 1) + ": Qty must be above zero";
            }

            decimal consQty = dto.Items.Sum(x => Convert.ToDecimal(x.JOCNVC_ConsQty));
            decimal consBatchQty = dto.ConsBatches.Sum(x => x.JOCNVC_BCH_BatchQty);
            if (Math.Abs(consQty - consBatchQty) > Tol)
                return "Consumption batch qty (" + consBatchQty.ToString("0.###") + ") must match item qty (" + consQty.ToString("0.###") + ")";

            // ---- production ----
            if (dto.Items_Production.Count == 0) return "Production item, at least one row required";

            for (int i = 0; i < dto.Items_Production.Count; i++)
            {
                var x = dto.Items_Production[i];
                if (x.JOCNVP_Item_Number == 0 || x.JOCNVP_WH_Number == 0 || x.JOCNVP_UoM_Number == 0)
                    return "Production row " + (i + 1) + ": Item / Warehouse / UoM is required";
                if (x.JOCNVP_ProdQty <= 0)
                    return "Production row " + (i + 1) + ": Qty must be above zero";

                decimal b = dto.ItemBatch_Production.Where(k => k.JOCNVP_BCH_JOCNVP_Number == i).Sum(k => k.JOCNVP_BCH_BatchQty);
                if (Math.Abs(b - x.JOCNVP_ProdQty) > Tol)
                    return "Production row " + (i + 1) + ": batch qty (" + b.ToString("0.###") + ") must match item qty (" + x.JOCNVP_ProdQty.ToString("0.###") + ")";
            }

            foreach (var b in dto.ItemBatch_Production)
            {
                if (b.JOCNVP_BCH_JOCNVP_Number < 0 || b.JOCNVP_BCH_JOCNVP_Number >= dto.Items_Production.Count
                    || string.IsNullOrWhiteSpace(b.JOCNVP_BCH_BatchNo) || b.JOCNVP_BCH_WH_Number == 0)
                    return "Production batch: Batch No / Warehouse is required";

                var itemSt = dto.Items_Production[b.JOCNVP_BCH_JOCNVP_Number].JOCNVP_ItemStatus;
                if (!string.Equals((b.JOCNVP_BCH_ItemStatus ?? "Good").Trim(), (itemSt ?? "Good").Trim(), StringComparison.OrdinalIgnoreCase))
                    return "Production batch: Status must match item Status";
            }

            // ---- scrap (optional) ----
            for (int i = 0; i < dto.Items_Scrap.Count; i++)
            {
                var x = dto.Items_Scrap[i];
                if (x.JOCNVS_Item_Number == 0 || x.JOCNVS_WH_Number == 0 || x.JOCNVS_UoM_Number == 0)
                    return "Scrap row " + (i + 1) + ": Item / Warehouse / UoM is required";
                if (x.JOCNVS_ScrapQty <= 0)
                    return "Scrap row " + (i + 1) + ": Qty must be above zero";

                decimal b = dto.ItemBatch_Scrap.Where(k => k.JOCNVS_BCH_JOCNVS_Number == i).Sum(k => k.JOCNVS_BCH_BatchQty);
                if (Math.Abs(b - x.JOCNVS_ScrapQty) > Tol)
                    return "Scrap row " + (i + 1) + ": batch qty (" + b.ToString("0.###") + ") must match item qty (" + x.JOCNVS_ScrapQty.ToString("0.###") + ")";
            }

            foreach (var b in dto.ItemBatch_Scrap)
                if (b.JOCNVS_BCH_JOCNVS_Number < 0 || b.JOCNVS_BCH_JOCNVS_Number >= dto.Items_Scrap.Count
                    || string.IsNullOrWhiteSpace(b.JOCNVS_BCH_BatchNo) || b.JOCNVS_BCH_WH_Number == 0)
                    return "Scrap batch: Batch No / Warehouse is required";

            return null;
        }

        #endregion

        #region Batch popup + temp reservation

        // otherWarehouses = false : same warehouse tab, true : other warehouses tab
        [HttpGet]
        [Route("joboutward/transactions/conversion/batch")]
        public JsonResult GetBatchDetails(long ItemNumber, long Warehouse, int ItemGridIndex, bool OtherWarehouses = false)
        {
            DataTable dt = DAO.GetBatchDetailsDB(ItemNumber, Warehouse, ItemGridIndex, CreatorCode, OtherWarehouses).Tables[0];
            var data = DL.JOConversionBatchList(dt).Select(b => new
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
                b.WarehouseCode
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
        }

        [HttpPost]
        [Route("joboutward/transactions/conversion/temp-save")]
        public IActionResult SaveTempBatch([FromBody] List<JOConversionTempBatch_DTO> list)
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

        // item row removed / item changed : release its reserved batches
        [HttpPost]
        [Route("joboutward/transactions/conversion/temp-clear-rows")]
        public IActionResult ClearTempRows([FromBody] List<JOConversionDeletedRowInfo_DTO> rows)
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
        [Route("joboutward/transactions/conversion/temp-clear")]
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
        [Route("joboutward/transactions/conversion-summary")]
        public IActionResult ConversionSummary(string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter)
        {
            var list = DL.JOConversionSummaryList(DAO.JOConversionSummaryDB().Tables[0]);

            if (string.IsNullOrEmpty(SortOrder)) SortOrder = "Default";
            ViewData["CurrentSort"] = SortOrder;
            ViewData["CurrentFilter"] = Search;

            IEnumerable<JOConversionSummary_DTO> Key = list;

            if (!string.IsNullOrEmpty(Search))
            {
                string s = Search.ToLower();
                Key = Key.Where(x =>
                    (x.JOCNVH_JournalNo ?? "").ToLower().Contains(s) ||
                    (x.JOCNVH_Date ?? "").ToLower().Contains(s) ||
                    (x.Segregation ?? "").ToLower().Contains(s) ||
                    (x.SFT_ShiftName ?? "").ToLower().Contains(s) ||
                    (x.JWWC_JW_WorkCentre ?? "").ToLower().Contains(s) ||
                    (x.JPRS_ProcessName ?? "").ToLower().Contains(s));
            }

            if (SortOrder == "Title")
                Key = Key.OrderBy(x => ParseDate(x.JOCNVH_Date)).ThenBy(x => x.JOCNVH_Number);
            else if (SortOrder == "Title_desc")
                Key = Key.OrderByDescending(x => ParseDate(x.JOCNVH_Date)).ThenByDescending(x => x.JOCNVH_Number);

            var result = ApplyPaging(Key, PageNumber, PSize);

            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JO_Conversion/ConversionSummary.cshtml",
                PaginatedList_DTO<JOConversionSummary_DTO>.CreateAsync(result, CPageNumber ?? 1, CPageSize));
        }

        #endregion

        #region Detailed

        // head columns are filled only on the first line of a journal, so search / sort work on the journal (group) head
        [AcceptVerbs("GET", "POST")]
        [Route("joboutward/transactions/conversion-detailed")]
        public IActionResult ConversionDetailed(string? SortOrder, string? Search, int? PageNumber, int PSize, string? PageFilter)
        {
            var list = DL.JOConversionDetailedList(DAO.JOConversionDetailedDB().Tables[0]);

            if (string.IsNullOrEmpty(SortOrder)) SortOrder = "Default";
            ViewData["CurrentSort"] = SortOrder;
            ViewData["CurrentFilter"] = Search;

            var heads = list.Where(x => x.JOCNVH_Number.HasValue)
                            .GroupBy(x => x.JOCNVH_Number!.Value)
                            .ToDictionary(g => g.Key, g => g.First());

            long cur = 0;
            var rows = list.Select((x, i) =>
            {
                if (x.JOCNVH_Number.HasValue) cur = x.JOCNVH_Number.Value;
                return new { Row = x, Head = cur, Idx = i };
            }).ToList();

            var q = rows.AsEnumerable();

            if (!string.IsNullOrEmpty(Search))
            {
                string s = Search.ToLower();
                q = q.Where(t =>
                {
                    if (!heads.TryGetValue(t.Head, out var h)) return false;
                    return (h.JOCNVH_JournalNo ?? "").ToLower().Contains(s) ||
                           (h.JOCNVH_Date ?? "").ToLower().Contains(s) ||
                           (h.Segregation ?? "").ToLower().Contains(s) ||
                           (h.SFT_ShiftName ?? "").ToLower().Contains(s) ||
                           (h.JWWC_JW_WorkCentre ?? "").ToLower().Contains(s) ||
                           (h.JPRS_ProcessName ?? "").ToLower().Contains(s);
                });
            }

            if (SortOrder == "Title")
                q = q.OrderBy(t => ParseDate(heads.ContainsKey(t.Head) ? heads[t.Head].JOCNVH_Date : null)).ThenBy(t => t.Head).ThenBy(t => t.Idx);
            else if (SortOrder == "Title_desc")
                q = q.OrderByDescending(t => ParseDate(heads.ContainsKey(t.Head) ? heads[t.Head].JOCNVH_Date : null)).ThenByDescending(t => t.Head).ThenBy(t => t.Idx);

            var result = ApplyPaging(q.Select(t => t.Row), PageNumber, PSize);

            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JO_Conversion/ConversionDetailed.cshtml",
                PaginatedList_DTO<JOConversionDetailed_DTO>.CreateAsync(result, CPageNumber ?? 1, CPageSize));
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
