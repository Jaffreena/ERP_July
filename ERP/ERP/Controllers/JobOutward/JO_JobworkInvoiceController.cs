using System.Linq;
using ERP.DataList;
using ERP.Models;
using ERP_DAO;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobOutward
{
    public class JO_JobworkInvoiceController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();

        Int32? DPageNumber;
        Int32 DPageSize;

        JO_JobworkInvoice_DAO JWI_DAO = new JO_JobworkInvoice_DAO();
        JO_JobworkInvoice_DL JWI_DL = new JO_JobworkInvoice_DL();

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;

        private const string ViewPath = "~/Views/JobworkOutward/JO_JobworkInvoice/";

        // ---------------------------------------------------------------- helpers
        // Browser sends picked dates as UTC -> convert back to server-local (same as Receipt Note)
        private static DateTime FromBrowserUtc(DateTime d)
        {
            return d.Kind == DateTimeKind.Utc ? d.ToLocalTime() : d;
        }

        private static void FixInvoiceDates(JO_JobworkInvoiceCreate_DTO dto)
        {
            if (dto?.Header != null)
            {
                dto.Header.JOSVIH_JournalDate = FromBrowserUtc(dto.Header.JOSVIH_JournalDate);
                dto.Header.JOSVIH_VendorInvoiceDate = FromBrowserUtc(dto.Header.JOSVIH_VendorInvoiceDate);
            }
        }

        private static bool Has(string? source, string search)
        {
            return (source ?? "").ToLower().Contains(search.ToLower());
        }

        private static DateTime ParseDate(string? s)
        {
            return string.IsNullOrEmpty(s) ? DateTime.Now : Convert.ToDateTime(s);
        }

        // validation shared by Save / Update
        private string? Validate(JO_JobworkInvoiceCreate_DTO dto)
        {
            if (dto == null) return "DTO is null";
            if (dto.Header == null) return "Header is null";
            if (dto.Items == null || dto.Items.Count == 0) return "Add at least one item.";
            if (dto.Header.JOSVIH_JW_Vendor_Number <= 0) return "Select a JW Vendor.";
            if (string.IsNullOrWhiteSpace(dto.Header.JOSVIH_JournalNo)) return "Journal No. is required.";
            if (string.IsNullOrWhiteSpace(dto.Header.JOSVIH_VendorInvoiceNo)) return "Vendor Invoice No. is required.";
            if (dto.Items.Any(i => i.JOSVII_Qty <= 0)) return "Invoice Qty must be greater than zero.";
            return null;
        }

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

        // ---------------------------------------------------------------- master combos
        // SP Id 1 : 0 Currency, 1 UoM, 2 SAC, 3 Process, 4 WHT code, 5 MaterialSegregation, 6 AddressType
        public void GetJobworkInvoiceData()
        {
            DataSet DS = JWI_DAO.JO_JobworkInvoiceDB(1);

            ViewBag.Currency = Help.GetCat(DS.Tables[0]);
            ViewBag.UoM = Help.GetCat(DS.Tables[1]);
            ViewBag.SAC = Help.GetCat(DS.Tables[2]);
            ViewBag.Process = Help.GetCat(DS.Tables[3]);
            ViewBag.WHTCode = Help.GetCat(DS.Tables[4]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[5]);
            ViewBag.AddressType = Help.GetCat(DS.Tables[6]);
        }

        // ---------------------------------------------------------------- vendor / tax lookups
        // vendor search : Currency + Tax Cluster + WH Tax Code come with the vendor (by Vendor Invoice Date)
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/vendor")]
        public IActionResult SearchVendor(String? Vendor, String? InvoiceDate)
        {
            DataSet DS = JWI_DAO.JO_JobworkInvoiceDB(5, ParseDate(InvoiceDate), Vendor ?? "");
            return Json(JWI_DL.VendorList(DS.Tables[0]));
        }

        // single vendor by number (re-fetch when Vendor Invoice Date changes)
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/vendor/get")]
        public IActionResult GetVendor(long VendorNumber, String? InvoiceDate)
        {
            DataSet DS = JWI_DAO.JO_JobworkInvoiceDB(10, ParseDate(InvoiceDate), null, VendorNumber);
            return Json(JWI_DL.VendorList(DS.Tables[0]));
        }

        // Tax Cluster dropdown for the vendor's territory
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/cluster")]
        public IActionResult GetTaxCluster(long VendorNumber, String? Search)
        {
            DataSet DS = JWI_DAO.JO_JobworkInvoiceDB(8, null, Search ?? "", VendorNumber);
            return Json(JWI_DL.TaxClusterList(DS.Tables[0]));
        }

        // WHT % / IncludeTax for vendor + WH Tax Code + Vendor Invoice Date
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/wht")]
        public IActionResult GetWHT(long VendorNumber, long WHTNumber, String? InvoiceDate)
        {
            DataSet DS = JWI_DAO.JO_JobworkInvoiceDB(7, ParseDate(InvoiceDate), null, VendorNumber, null, null, WHTNumber);
            return Json(JWI_DL.WHTList(DS.Tables[0]));
        }

        // GST amount rows for one item (Cluster + SAC + Vendor Invoice Date + base amount)
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/gst")]
        public IActionResult GetGst(long Cluster, long SAC, String? InvoiceDate, double BaseAmount)
        {
            var list = JWI_DAO.CalculateGST(Cluster, ParseDate(InvoiceDate), SAC, BaseAmount);
            return Json(list);
        }

        // ---------------------------------------------------------------- Receipt Note popup
        // RN list (JWI = Yes, remaining > 0). JOSVIH_Number : Edit mode only
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/receipt-note")]
        public IActionResult GetReceiptNoteGroup(long VendorNumber, long MSNumber, long? JOSVIH_Number = null)
        {
            DataSet DS = JWI_DAO.GetReceiptNote_GroupItem(VendorNumber, MSNumber, JOSVIH_Number);
            return Json(JWI_DL.ReceiptNoteGroupList(DS.Tables[0]));
        }

        // RN items for the selected RNs (comma separated RN numbers)
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/receipt-note-items")]
        public IActionResult GetReceiptNoteItems(long VendorNumber, string RNNumbers)
        {
            DataSet DS = JWI_DAO.GetReceiptNote_ForInvoice(VendorNumber, RNNumbers ?? "");
            return Json(JWI_DL.ReceiptNoteItemList(DS.Tables[0]));
        }

        // Service Order dropdown for one invoice row (Vendor + Process + Item + UoM)
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/service-order")]
        public IActionResult GetServiceOrderList(long VendorNumber, long JPRS_Number, long Item_Number, long UoM_Number, long? JOSVIH_Number = null)
        {
            DataSet DS = JWI_DAO.GetServiceOrderByVendor(VendorNumber, JPRS_Number, Item_Number, UoM_Number, JOSVIH_Number);
            var list = JWI_DL.ServiceOrderList(DS.Tables[0]);
            return Json(list.Select(x => new
            {
                value = x.JOJWI_SVOH_Number,
                text = x.JOJWI_SVOH_ServiceOrderNo,
                svoiNumber = x.JOJWI_SVOI_Number
            }));
        }

        // Unit price + previously invoiced qty of the selected Service Order
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/service-order-item-info")]
        public IActionResult GetServiceOrderItemInfo(long SVOH_Number, long JPRS_Number, long Item_Number, long UoM_Number, long? JOSVIH_Number = null)
        {
            DataSet DS = JWI_DAO.GetServiceOrderItemInfo(SVOH_Number, JPRS_Number, Item_Number, UoM_Number, JOSVIH_Number);
            var info = JWI_DL.ServiceOrderInfo(DS.Tables[0]);
            return Json(new
            {
                svoiNumber = info.JOJWI_SVOI_Number,
                unitPrice = info.JOJWI_SVOI_UnitPrice,
                amount = info.JOJWI_SVOI_Amount,
                svoiQty = info.JOJWI_SVOI_Qty,                 // SO item total qty
                prevInvoiceQty = info.PrevInvoiceQty           // other invoices only (this invoice excluded)
            });
        }

        // next Journal No from Number Setup (by Journal Date)
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/next-journal-number")]
        public IActionResult GetNextJournalNumber(String? JournalDate)
        {
            try
            {
                string number = JWI_DAO.GetNextJournalNumber(ParseDate(JournalDate));
                return Json(new { success = true, number = number });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "Journal Number is not configured for the selected date." });
            }
        }

        // saved address of one invoice
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/address")]
        public IActionResult GetInvoiceAddress(long JOSVIH_Number)
        {
            DataSet DS = JWI_DAO.GetJobworkInvoiceAddressDB(JOSVIH_Number);
            return Json(JWI_DL.AddressList(DS.Tables[0]));
        }
        // vendor master addresses (Address popup default load, Create page)
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/vendor-address")]
        public IActionResult GetVendorAddress(long VendorNumber)
        {
            DataSet DS = JWI_DAO.GetVendorAddressDB(VendorNumber);
            return Json(JWI_DL.AddressList(DS.Tables[0]));
        }
        // ---------------------------------------------------------------- DFS GET
        #region Default Form Setting (DFS) get
        // Create page only: loads default values on page load
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice-dfs/get")]
        public IActionResult GetJobworkInvoiceDFS()
        {
            JOSVI_DFS_DAO dao = new JOSVI_DFS_DAO();

            DataSet ds = dao.JO_JobworkInvoiceDFSGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        josvI_DFS_Number = row["JOSVI_DFS_Number"],
                        josvI_DFS_MS_Number = row["JOSVI_DFS_MS_Number"],
                        josvI_DFS_JW_Vendor_Number = row["JOSVI_DFS_JW_Vendor_Number"],
                        jwV_JW_VendorName = row["JWV_JW_VendorName"],
                        josvI_DFS_PaymentTerms = row["JOSVI_DFS_PaymentTerms"],
                        josvI_DFS_PaymentMethod = row["JOSVI_DFS_PaymentMethod"],
                        josvI_DFS_Remarks = row["JOSVI_DFS_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }
        #endregion

        // ---------------------------------------------------------------- CREATE
        #region Jobwork Invoice Create
        [Route("joboutward/transactions/jobwork-invoice")]
        public IActionResult Index()
        {
            GetJobworkInvoiceData();
            ViewBag.Collapse = true;
            return View(ViewPath + "Index.cshtml");
        }

        [HttpPost]
        [Route("joboutward/transactions/jobwork-invoice/save")]
        public IActionResult SaveJobworkInvoice([FromBody] JO_JobworkInvoiceCreate_DTO dto)
        {
            try
            {
                string? err = Validate(dto);
                if (err != null)
                    return Json(new { success = false, message = err });

                FixInvoiceDates(dto);
                dto.Header.CreatorCode = UserCode;

                long josvihNumber = JWI_DAO.JobworkInvoiceInsertDB(dto);

                return Json(new
                {
                    success = true,
                    invoiceNumber = josvihNumber,
                    redirectUrl = Url.Action("JobworkInvoiceSummary", "JO_JobworkInvoice")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
        #endregion

        // ---------------------------------------------------------------- EDIT / VIEW
        #region Jobwork Invoice Edit / View
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/edit")]
        public IActionResult Edit(long JOSVIH_Number)
        {
            return LoadInvoicePage(JOSVIH_Number, false);
        }

        // Read-only page : same page and same data as Edit
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/view")]
        public IActionResult ViewInvoice(long JOSVIH_Number)
        {
            return LoadInvoicePage(JOSVIH_Number, true);
        }

        private IActionResult LoadInvoicePage(long JOSVIH_Number, bool isViewMode)
        {
            GetJobworkInvoiceData();

            DataSet DS = JWI_DAO.GetJobworkInvoice(JOSVIH_Number);
            JO_JobworkInvoiceCreate_DTO dto = JWI_DL.InvoiceModel(DS);

            ViewBag.Collapse = true;
            ViewBag.IsViewMode = isViewMode;
            return View(ViewPath + "Edit.cshtml", dto);
        }

        // same data as JSON (for the JS grid load)
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/get")]
        public JsonResult GetJobworkInvoice(long JOSVIH_Number)
        {
            DataSet DS = JWI_DAO.GetJobworkInvoice(JOSVIH_Number);
            return Json(JWI_DL.InvoiceModel(DS));
        }

        [HttpPost]
        [Route("joboutward/transactions/jobwork-invoice/update")]
        public IActionResult UpdateJobworkInvoice([FromBody] JO_JobworkInvoiceCreate_DTO dto)
        {
            try
            {
                string? err = Validate(dto);
                if (err != null)
                    return Json(new { success = false, message = err });

                if (dto.Header.JOSVIH_Number <= 0)
                    return Json(new { success = false, message = "Invoice number is missing." });

                FixInvoiceDates(dto);
                dto.Header.EditorCode = UserCode;

                JWI_DAO.JobworkInvoiceUpdateDB(dto);

                return Json(new
                {
                    success = true,
                    redirectUrl = Url.Action("JobworkInvoiceSummary", "JO_JobworkInvoice")
                });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
        #endregion

        // ---------------------------------------------------------------- SUMMARY
        #region Jobwork Invoice Summary
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice-summary")]
        public IActionResult JobworkInvoiceSummary(String? SortOrder, String? Search, Int32? PageNumber,
                                                   Int32 PSize, String? PageFilter)
        {
            var list = SummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(ViewPath + "JobworkInvoiceSummary.cshtml",
                PaginatedList_DTO<JO_JobworkInvoiceSummary_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        [HttpPost]
        [Route("joboutward/transactions/jobwork-invoice-summary")]
        public IActionResult JobworkInvoiceSummary(String? SortOrder, String? Search, Int32? PageNumber,
                                                   Int32 PSize, String? PageFilter, String? Mode, String? JOSVIH_No)
        {
            if (Mode == "View")
                return RedirectToAction("ViewInvoice", new { JOSVIH_Number = JOSVIH_No });

            if (Mode == "Edit")
                return RedirectToAction("Edit", new { JOSVIH_Number = JOSVIH_No });

            var list = SummaryGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(ViewPath + "JobworkInvoiceSummary.cshtml",
                PaginatedList_DTO<JO_JobworkInvoiceSummary_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        List<JO_JobworkInvoiceSummary_DTO> SummaryGetData(String? SortOrder, String? Search, Int32? PageNumber,
                                                          Int32 PSize, String? PageFilter)
        {
            DS = JWI_DAO.GetJobworkInvoiceList();
            var all = JWI_DL.SummaryList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder)) SortOrder = "Title_desc";

            var Key = all.OrderByDescending(Cs => Cs.JOSVIH_Number).AsEnumerable();

            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>
                    Has(K.JOSVIH_JournalNo, Search) ||
                    Has(K.JOSVIH_JournalDate.ToString(), Search) ||
                    Has(K.JOSVIH_VendorInvoiceNo, Search) ||
                    Has(K.JOSVIH_VendorInvoiceDate.ToString(), Search) ||
                    Has(K.RN_List, Search) ||
                    Has(K.JWV_JW_VendorName, Search) ||
                    Has(K.VendorGroup, Search) ||
                    Has(K.VendorCategory, Search) ||
                    Has(K.CurrencyCode, Search) ||
                    Has(K.TaxCluster, Search) ||
                    Has(K.Segregation, Search) ||
                    Has(K.WarehouseCode, Search)
                ).OrderByDescending(Cs => Cs.JOSVIH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc": Key = Key.OrderByDescending(K => K.JOSVIH_VendorInvoiceDate); break;
                case "Title": Key = Key.OrderBy(K => K.JOSVIH_VendorInvoiceDate); break;
                default: Key = Key.OrderByDescending(K => K.JOSVIH_Number); break;
            }

            var result = Key.ToList();

            SetPaging(result.Count, PageNumber, PSize, PageFilter, SortOrder, Search);

            // filtered-grid totals (Amount now sums Amount, not Qty)
            ViewBag.SumOfQty = result.Sum(x => x.TotalQty);
            ViewBag.SumOfQtyKgs = result.Sum(x => x.TotalQty_Kgs);
            ViewBag.SumOfAmount = result.Sum(x => x.Amount);
            ViewBag.SumOfHeadGst = result.Sum(x => x.GST_Amount);
            ViewBag.SumOfWHT = result.Sum(x => x.WH_TaxAmount);

            // grand totals of all records (SP result 1)
            if (DS.Tables.Count > 1)
            {
                var g = JWI_DL.SummaryTotals(DS.Tables[1]);
                ViewBag.GrandQty = g.GrandTotalQty;
                ViewBag.GrandQtyKgs = g.GrandTotalQtyKgs;
                ViewBag.GrandAmount = g.GrandTotalAmount;
                ViewBag.GrandGST = g.GrandTotalGST;
                ViewBag.GrandWHT = g.GrandTotalWHT;
            }

            return result;
        }
        #endregion

        // ---------------------------------------------------------------- DETAILED
        #region Jobwork Invoice Detailed
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice-detailed")]
        public IActionResult JobworkInvoiceDetailed(String? SortOrder, String? Search, Int32? PageNumber,
                                                    Int32 PSize, String? PageFilter)
        {
            var list = DetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(ViewPath + "JobworkInvoiceDetailed.cshtml",
                PaginatedList_DTO<JO_JobworkInvoiceDetailed_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        [HttpPost]
        [Route("joboutward/transactions/jobwork-invoice-detailed")]
        public IActionResult JobworkInvoiceDetailed(String? SortOrder, String? Search, Int32? PageNumber,
                                                    Int32 PSize, String? PageFilter, String? Mode, String? JOSVIH_No)
        {
            if (Mode == "View")
                return RedirectToAction("ViewInvoice", new { JOSVIH_Number = JOSVIH_No });

            if (Mode == "Edit")
                return RedirectToAction("Edit", new { JOSVIH_Number = JOSVIH_No });

            var list = DetailedGetData(SortOrder, Search, PageNumber, PSize, PageFilter);
            ViewBag.Collapse = true;
            return View(ViewPath + "JobworkInvoiceDetailed.cshtml",
                PaginatedList_DTO<JO_JobworkInvoiceDetailed_DTO>.CreateAsync(list, DPageNumber ?? 1, DPageSize));
        }

        List<JO_JobworkInvoiceDetailed_DTO> DetailedGetData(String? SortOrder, String? Search, Int32? PageNumber,
                                                            Int32 PSize, String? PageFilter)
        {
            DS = JWI_DAO.GetJobworkInvoiceListDetailed();
            var all = JWI_DL.DetailedList(DS.Tables[0]);

            if (String.IsNullOrEmpty(SortOrder)) SortOrder = "Title_desc";

            var Key = all.OrderByDescending(Cs => Cs.JOSVIH_Number).AsEnumerable();

            if (!String.IsNullOrEmpty(Search))
            {
                Key = Key.Where(K =>
                    Has(K.JOSVIH_JournalNo, Search) ||
                    Has(K.JOSVIH_VendorInvoiceNo, Search) ||
                    Has(K.JOSVIH_VendorInvoiceDate.ToString(), Search) ||
                    Has(K.JORNH_RN_No, Search) ||
                    Has(K.JOSVII_Vendor_DN_No, Search) ||
                    Has(K.JWV_JW_VendorName, Search) ||
                    Has(K.VendorGroup, Search) ||
                    Has(K.VendorCategory, Search) ||
                    Has(K.CurrencyCode, Search) ||
                    Has(K.TaxCluster, Search) ||
                    Has(K.ServiceOrderNo, Search) ||
                    Has(K.JPRS_ProcessName, Search) ||
                    Has(K.ItemCode, Search) ||
                    Has(K.ItemDescription, Search) ||
                    Has(K.ItemGroup, Search) ||
                    Has(K.WarehouseCode, Search)
                ).OrderByDescending(Cs => Cs.JOSVIH_Number);
            }

            switch (SortOrder)
            {
                case "Title_desc": Key = Key.OrderByDescending(K => K.JOSVIH_VendorInvoiceDate); break;
                case "Title": Key = Key.OrderBy(K => K.JOSVIH_VendorInvoiceDate); break;
                default: Key = Key.OrderByDescending(K => K.JOSVIH_Number); break;
            }

            var result = Key.ToList();

            SetPaging(result.Count, PageNumber, PSize, PageFilter, SortOrder, Search);

            ViewBag.SumOfQty = result.Sum(x => x.JOSVII_Qty);
            ViewBag.SumOfAmount = result.Sum(x => x.JOSVII_Amount);
            ViewBag.SumOfHeadGst = result.Sum(x => x.JOSVII_GST_Amount);
            ViewBag.SumOfWHT = result.Sum(x => x.JOSVII_WH_TaxAmount);

            if (DS.Tables.Count > 1)
            {
                var g = JWI_DL.DetailedTotals(DS.Tables[1]);
                ViewBag.GrandQty = g.TotalQty;
                ViewBag.GrandAmount = g.TotalAmount;
                ViewBag.GrandGST = g.TotalGST;
                ViewBag.GrandWHT = g.TotalWHT;
            }

            return result;
        }
        #endregion
    }
}