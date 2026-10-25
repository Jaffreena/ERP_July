using ERP.DataList;
using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;

namespace ERP.Controllers.JobworkOutward
{
    public class JO_FreightInvoiceController : Controller
    {
        Help Help = new Help();
        JO_FreightInvoice_DAO DAO = new JO_FreightInvoice_DAO();
        JO_FreightInvoice_DL DL = new JO_FreightInvoice_DL();
        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;
        Int32? DPageNumber;
        Int32 DPageSize;

        const string ViewPath = "~/Views/JobworkOutward/JO_FreightInvoice/";

        static readonly JsonSerializerOptions CamelJson = new JsonSerializerOptions
        {
            PropertyNamingPolicy = null,   // exact property / column names (JS uses same names)
            WriteIndented = true
        };

        // DataTable -> list of dictionaries (keys = exact column names, DBNull -> null)
        static List<Dictionary<string, object>> Rows(DataTable dt)
        {
            var list = new List<Dictionary<string, object>>();
            foreach (DataRow r in dt.Rows)
            {
                var d = new Dictionary<string, object>();
                foreach (DataColumn c in dt.Columns)
                    d[c.ColumnName] = r[c] == DBNull.Value ? null : r[c];
                list.Add(d);
            }
            return list;
        }

        #region Default Form Setting (DFS) get
        // Create page only: loads default values on page load
        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice-dfs/get")]
        public IActionResult GetFreightInvoiceDFS()
        {
            JOFTI_DFS_DAO dao = new JOFTI_DFS_DAO();

            DataSet ds = dao.JO_FreightInvoiceDFSGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        joftI_DFS_Number = row["JOFTI_DFS_Number"],
                        joftI_DFS_Category = row["JOFTI_DFS_Category"],
                        joftI_DFS_JW_Vendor_Number = row["JOFTI_DFS_JW_Vendor_Number"],
                        jwV_JW_VendorName = row["JWV_JW_VendorName"],
                        joftI_DFS_PaymentTerms = row["JOFTI_DFS_PaymentTerms"],
                        joftI_DFS_PaymentMethod = row["JOFTI_DFS_PaymentMethod"],
                        joftI_DFS_Remarks = row["JOFTI_DFS_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }
        #endregion

        #region Pages

        [Route("joboutward/transactions/jo-freight-invoice/create")]
        public IActionResult Create()
        {
            GetLookupData();
            ViewBag.Collapse = true;
            return View(ViewPath + "Create.cshtml");
        }

        [Route("joboutward/transactions/jo-freight-invoice/edit")]
        public IActionResult Edit(long SI_No)
        {
            GetLookupData();
            ViewBag.Collapse = true;
            ViewBag.JOFTIH_Number = SI_No;
            return View(ViewPath + "Edit.cshtml");
        }

        [Route("joboutward/transactions/jo-freight-invoice/view")]
        public IActionResult ViewInvoice(long SI_No)
        {
            GetLookupData();
            ViewBag.Collapse = true;
            ViewBag.IsViewMode = true;
            ViewBag.JOFTIH_Number = SI_No;
            return View(ViewPath + "Edit.cshtml");
        }

        // Tables: 0 Currency, 1 UoM, 2 Warehouse, 3 SAC, 4 Process, 5 WHT, 6 AddressType, 7 JOFRT SO list
        void GetLookupData()
        {
            DataSet DS = DAO.FreightInvoiceLookupDB();
            ViewBag.Currency = Help.GetCat(DS.Tables[0]);
            ViewBag.UoM = Help.GetCat(DS.Tables[1]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[2]);
            ViewBag.SAC = Help.GetCat(DS.Tables[3]);
            ViewBag.Process = Help.GetCat(DS.Tables[4]);
            ViewBag.WHT = Help.GetCat(DS.Tables[5]);
            ViewBag.AddressType = Help.GetCat(DS.Tables[6]);
            ViewBag.SON = Help.GetCat(DS.Tables[7]);
        }

        #endregion

        #region Save / Update / Get

        [HttpPost]
        [Route("joboutward/transactions/jo-freight-invoice/save")]
        public IActionResult SaveFreightInvoice([FromBody] JO_FreightInvoiceCreate_DTO dto)
        {
            if (dto == null || dto.Header == null)
                return Json(new { success = false, message = "Invalid data." });
            try
            {
                long no = DAO.FreightInvoiceInsertDB(dto);
                return Json(new
                {
                    success = true,
                    number = no,
                    redirectUrl = Url.Action("FreightInvoiceSummary", "JO_FreightInvoice")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        [Route("joboutward/transactions/jo-freight-invoice/update")]
        public IActionResult UpdateFreightInvoice([FromBody] JO_FreightInvoiceCreate_DTO dto)
        {
            if (dto == null || dto.Header == null)
                return Json(new { success = false, message = "Invalid data." });
            try
            {
                DAO.FreightInvoiceUpdateDB(dto);
                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action("FreightInvoiceSummary", "JO_FreightInvoice")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        // Edit / View load : { header, items, addresses, gst }
        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/get")]
        public JsonResult GetFreightInvoice(long JOFTIH_Number)
        {
            DataSet ds = DAO.GetFreightInvoiceDB(JOFTIH_Number);
            var header = ds.Tables[0].Rows.Count > 0 ? Rows(ds.Tables[0])[0] : new Dictionary<string, object>();

            return new JsonResult(new
            {
                header,
                items = Rows(ds.Tables[1]),
                addresses = Rows(ds.Tables[2]),
                gst = Rows(ds.Tables[3])
            }, CamelJson);
        }

        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/address")]
        public JsonResult GetFreightInvoiceAddress(long JOFTIH_Number)
        {
            return new JsonResult(Rows(DAO.GetFreightInvoiceAddressDB(JOFTIH_Number).Tables[0]), CamelJson);
        }

        #endregion

        #region Vendor / Tax lookups  (reuse JO_JobworkInvoice_SP)

        // Id 5 : vendor search (name -> currency, TCT, WHT, payment terms ...)
        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/vendor-search")]
        public JsonResult VendorSearch(string Search, DateTime InvoiceDate)
        {
            var dt = DAO.VendorLookupDB(5, InvoiceDate, Search).Tables[0];
            return new JsonResult(Rows(dt), CamelJson);
        }

        // Id 10 : vendor details by number (on vendor/date change)
        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/vendor-info")]
        public JsonResult VendorInfo(long VendorNumber, DateTime InvoiceDate)
        {
            var dt = DAO.VendorLookupDB(10, InvoiceDate, null, VendorNumber).Tables[0];
            return new JsonResult(Rows(dt), CamelJson);
        }

        // Id 8 : tax cluster list for vendor
        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/tax-cluster")]
        public JsonResult TaxCluster(long VendorNumber, string Search = "")
        {
            var dt = DAO.VendorLookupDB(8, null, Search, VendorNumber).Tables[0];
            return new JsonResult(Rows(dt), CamelJson);
        }

        // Id 12 : GST calc rows for cluster + SAC + date (GST popup)
        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/gst-calc")]
        public JsonResult GstCalc(long TaxCluster, long SAC, DateTime InvoiceDate)
        {
            var dt = DAO.VendorLookupDB(12, InvoiceDate, null, null, TaxCluster, SAC).Tables[0];
            return new JsonResult(Rows(dt), CamelJson);
        }

        // Id 7 : WHT % (only returns rows if vendor WithholdTax = 1)
        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/wht-percent")]
        public JsonResult WhtPercent(long VendorNumber, long WHTNumber, DateTime InvoiceDate)
        {
            var dt = DAO.VendorLookupDB(7, InvoiceDate, null, VendorNumber, null, null, WHTNumber).Tables[0];
            return new JsonResult(Rows(dt), CamelJson);
        }

        // Vendor address (JWV_Address). ADTP optional: all rows of vendor, or only that Address Type
        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/vendor-address")]
        public JsonResult VendorAddress(long VendorNumber, long? ADTPNumber = null)
        {
            var dt = DAO.GetVendorAddressDB(VendorNumber, ADTPNumber).Tables[0];
            return new JsonResult(Rows(dt), CamelJson);
        }

        #endregion

        #region DN / RN popup  (Category = DELIVERY NOTE / RECEIPT NOTE)

        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/source-group")]
        public JsonResult GetSourceGroup(long VendorNumber, string Category)
        {
            DataTable dt = IsReceipt(Category)
                ? DAO.GetReceiptNoteGroupDB(VendorNumber).Tables[0]
                : DAO.GetDeliveryNoteGroupDB(VendorNumber).Tables[0];

            return new JsonResult(DL.SourceGroupList(dt), CamelJson);
        }

        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/source-items")]
        public JsonResult GetSourceItems(long VendorNumber, string Category, string Numbers)
        {
            DataTable dt = IsReceipt(Category)
                ? DAO.GetReceiptNoteItemsDB(VendorNumber, Numbers).Tables[0]
                : DAO.GetDeliveryNoteItemsDB(VendorNumber, Numbers).Tables[0];

            return new JsonResult(DL.SourceItemList(dt), CamelJson);
        }

        static bool IsReceipt(string category)
        {
            return string.Equals(category?.Trim(), "RECEIPT NOTE", StringComparison.OrdinalIgnoreCase);
        }

        #endregion

        #region Freight Service Order

        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/freight-so")]
        public JsonResult GetFreightServiceOrder(long vendorId, string category, long? uomNumber = null, long? fromWHNumber = null, long? toWHNumber = null)
        {
            var dt = DAO.GetFreightServiceOrderDB(vendorId, category, uomNumber, fromWHNumber, toWHNumber).Tables[0];
            var data = DL.ServiceOrderDropdownList(dt)
                         .Select(x => new { value = x.JOFRT_SVOH_Number, text = x.ServiceOrderNo, jofrtSvoiNumber = x.JOFRT_SVOI_Number })
                         .ToList();
            return new JsonResult(data, CamelJson);
        }

        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/freight-so-item")]
        public JsonResult GetFreightServiceOrderItemInfo(long JOFRT_SVOH_Number, long FromWH, long ToWH, long UoM_Number)
        {
            var dt = DAO.GetFreightServiceOrderItemInfoDB(JOFRT_SVOH_Number, FromWH, ToWH, UoM_Number).Tables[0];
            if (dt.Rows.Count == 0) return new JsonResult(null);

            var r = dt.Rows[0];
            return new JsonResult(new
            {
                jofrtSvoiNumber = r["JOFRT_SVOI_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JOFRT_SVOI_Number"]),
                unitPrice = r["UnitPrice"] == DBNull.Value ? (decimal?)null : Convert.ToDecimal(r["UnitPrice"])
            }, CamelJson);
        }

        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/check-allowed-qty")]
        public JsonResult CheckAllowedQty(long jofrtSvohNumber, long jprsNumber, long fromWH, long toWH, long uomNumber, long joftihNumber = 0)
        {
            var dt = DAO.CheckAllowedQtyDB(jofrtSvohNumber, jprsNumber, fromWH, toWH, uomNumber, joftihNumber).Tables[0];
            var r = dt.Rows.Count > 0 ? dt.Rows[0] : null;
            return new JsonResult(new
            {
                soQty = r == null || r["SO_Qty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["SO_Qty"]),
                usedQty = r == null || r["UsedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["UsedQty"])
            }, CamelJson);
        }

        #endregion

        #region Next Journal No (Number Setup)

        // Create page only: next Journal No by Journal Date
        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/next-journal-number")]
        public IActionResult GetNextJournalNumber(string? JournalDate)
        {
            try
            {
                string number = DAO.GetNextJournalNumber(ParseDate(JournalDate ?? ""));
                return Json(new { success = true, number = number });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "Journal Number is not configured for the selected date." });
            }
        }

        #endregion

        #region Summary

        [Route("joboutward/transactions/jo-freight-invoice/summary")]
        public IActionResult FreightInvoiceSummary(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            var list = SummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(ViewPath + "FreightInvoiceSummary.cshtml",
                PaginatedList_DTO<JO_FreightInvoiceSummary_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        [Route("joboutward/transactions/jo-freight-invoice/summary")]
        [HttpPost]
        public IActionResult FreightInvoiceSummary(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter, String? Mode, String? DeleteNumbers, String? SI_No, String[] DeleteNumber, String selectAllCheckbox)
        {
            if (Mode == "Edit") return RedirectToAction("Edit", new { SI_No });
            if (Mode == "View") return RedirectToAction("ViewInvoice", new { SI_No });

            var list = SummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(ViewPath + "FreightInvoiceSummary.cshtml",
                PaginatedList_DTO<JO_FreightInvoiceSummary_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        List<JO_FreightInvoiceSummary_DTO> SummaryGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            DPageSize = 10;

            DataSet DS = DAO.GetFreightInvoiceList();
            var all = DL.FreightInvoiceSummaryList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder)) SortOrder = "Title_desc";
            if (Convert.ToInt32(PageNumber) == 0) DPageNumber = 1;
            if (PageFilter?.ToLower() == "pagefilter") DPageNumber = 1;

            ViewData["CurrentSort"] = SortOrder;
            ViewData["KeySort"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;

            IEnumerable<JO_FreightInvoiceSummary_DTO> Key = all.OrderByDescending(x => x.JOFTIH_Number);

            if (!String.IsNullOrEmpty(Search))
            {
                string s = Search.ToLower();
                Key = Key.Where(K =>
                    (K.JOFTIH_JournalNo ?? "").ToLower().Contains(s) ||
                    (K.JOFTIH_JournalDate ?? "").ToLower().Contains(s) ||
                    (K.JOFTIH_VendorInvoiceNo ?? "").ToLower().Contains(s) ||
                    (K.JOFTIH_VendorInvoiceDate ?? "").ToLower().Contains(s) ||
                    (K.JOFTIH_Category ?? "").ToLower().Contains(s) ||
                    (K.JWV_JW_VendorName ?? "").ToLower().Contains(s) ||
                    (K.CurrencyCode ?? "").ToLower().Contains(s) ||
                    (K.DN_List ?? "").ToLower().Contains(s) ||
                                    (K.SO_List ?? "").ToLower().Contains(s) ||
                    (K.WH_TaxCode ?? "").ToLower().Contains(s) ||
                    K.Amount.ToString().Contains(s) ||
                    K.TotalQty.ToString().Contains(s));
            }

            switch (SortOrder)
            {
                case "Title": Key = Key.OrderBy(K => ParseDate(K.JOFTIH_JournalDate)); break;
                default: Key = Key.OrderByDescending(K => ParseDate(K.JOFTIH_JournalDate)); break;
            }

            var result = Key.ToList();
            SetPaging(result.Count, PageNumber, PSize);

            var t = DS.Tables.Count > 1 ? DL.FreightInvoiceSummaryTotal(DS.Tables[1]) : new JO_FreightInvoiceSummaryTotal_DTO();
            ViewBag.SumOfQty = (double)t.GrandTotalQty;
            ViewBag.SumOfQtyKgs = (double)t.GrandTotalQtyKgs;
            ViewBag.SumOfAmount = (double)t.GrandTotalAmount;
            ViewBag.SumOfGST = (double)t.GrandTotalGST;
            ViewBag.SumOfWHT = (double)t.GrandTotalWHT;

            return result;
        }

        #endregion

        #region Detailed

        [Route("joboutward/transactions/jo-freight-invoice/detailed")]
        public IActionResult FreightInvoiceDetailed(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            var list = DetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(ViewPath + "FreightInvoiceDetailed.cshtml",
                PaginatedList_DTO<JO_FreightInvoiceDetail_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        [Route("joboutward/transactions/jo-freight-invoice/detailed")]
        [HttpPost]
        public IActionResult FreightInvoiceDetailed(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter, String? Mode, String? DeleteNumbers, String? SI_No, String[] DeleteNumber, String selectAllCheckbox)
        {
            if (Mode == "Edit") return RedirectToAction("Edit", new { SI_No });
            if (Mode == "View") return RedirectToAction("ViewInvoice", new { SI_No });

            var list = DetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            return View(ViewPath + "FreightInvoiceDetailed.cshtml",
                PaginatedList_DTO<JO_FreightInvoiceDetail_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        List<JO_FreightInvoiceDetail_DTO> DetailedGetData(String? SortOrder, String? Search, Int32? PageNumber, Int32 PSize, String? PageFilter)
        {
            DPageSize = 10;

            DataSet DS = DAO.GetFreightInvoiceListDetailed();
            var all = DL.FreightInvoiceDetailList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder)) SortOrder = "Title_desc";
            if (Convert.ToInt32(PageNumber) == 0) DPageNumber = 1;
            if (PageFilter?.ToLower() == "pagefilter") DPageNumber = 1;

            ViewData["CurrentSort"] = SortOrder;
            ViewData["KeySort"] = SortOrder == "Title" ? "Title_desc" : "Title";
            ViewData["CurrentFilter"] = Search;

            IEnumerable<JO_FreightInvoiceDetail_DTO> Key = all.OrderByDescending(x => x.JOFTIH_Number);

            if (!String.IsNullOrEmpty(Search))
            {
                string s = Search.ToLower();
                Key = Key.Where(K =>
                    (K.JOFTIH_JournalNo ?? "").ToLower().Contains(s) ||
                    (K.JOFTIH_JournalDate ?? "").ToLower().Contains(s) ||
                    (K.JOFTIH_VendorInvoiceNo ?? "").ToLower().Contains(s) ||
                    (K.JOFTIH_VendorInvoiceDate ?? "").ToLower().Contains(s) ||
                    (K.JOFTIH_Category ?? "").ToLower().Contains(s) ||
                                   (K.SourceNo ?? "").ToLower().Contains(s) ||
                    (K.WH_TaxCode ?? "").ToLower().Contains(s) ||
                    (K.Vendor_DN_No ?? "").ToLower().Contains(s) ||
                    (K.ServiceOrderNo ?? "").ToLower().Contains(s) ||
                    (K.JWV_JW_VendorName ?? "").ToLower().Contains(s) ||
                    (K.CurrencyCode ?? "").ToLower().Contains(s) ||
                    (K.ItemCode ?? "").ToLower().Contains(s) ||
                    K.JOFTII_Amount.ToString().Contains(s) ||
                    K.JOFTII_Qty_Kgs.ToString().Contains(s));
            }

            switch (SortOrder)
            {
                case "Title": Key = Key.OrderBy(K => ParseDate(K.JOFTIH_JournalDate)); break;
                default: Key = Key.OrderByDescending(K => ParseDate(K.JOFTIH_JournalDate)); break;
            }

            var result = Key.ToList();
            SetPaging(result.Count, PageNumber, PSize);

            var t = DS.Tables.Count > 1 ? DL.FreightInvoiceDetailTotal(DS.Tables[1]) : new JO_FreightInvoiceDetailTotal_DTO();
            ViewBag.SumOfQty = (double)t.TotalQty;
            ViewBag.SumOfQtyKgs = (double)t.TotalQtyKgs;
            ViewBag.SumOfAmount = (double)t.TotalAmount;
            ViewBag.SumOfGST = (double)t.TotalGST;
            ViewBag.SumOfWHT = (double)t.TotalWHT;

            return result;
        }

        #endregion

        #region helpers

        static DateTime ParseDate(string s)
        {
            return DateTime.TryParse(s, out var d) ? d : DateTime.MinValue;
        }

        void SetPaging(int record, Int32? PageNumber, Int32 PSize)
        {
            if (PSize != 0) DPageSize = PSize;

            int pageCount = (int)Math.Ceiling((double)record / DPageSize);
            int pn = Convert.ToInt32(PageNumber);

            if (pn <= 1) DPageNumber = 1;
            else if (record > (pn - 1) * DPageSize) DPageNumber = pn;
            else DPageNumber = pn > pageCount ? pageCount : pn;

            ViewBag.Page = Help.PageSize(PSize.ToString());
            ViewData["PageNumber"] = DPageNumber;
            ViewData["PageSize"] = DPageSize;
            ViewData["PageCount"] = pageCount;
            ViewData["TotalSize"] = record;
        }

        #endregion
    }
}