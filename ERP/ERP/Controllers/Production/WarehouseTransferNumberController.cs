using ERP.Models;
using ERP_DAO.ProductionTransaction;
using ERP_DL;
using ERP_DTO.ProductionTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.Production
{
    public class WarehouseTransferNumberController : Controller
    {
        Help Help = new Help();
        WarehouseTransfer_DAO DAO = new WarehouseTransfer_DAO();
        WarehouseTransfer_DL DL = new WarehouseTransfer_DL();

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;
        int CreatorCode => Convert.ToInt32(UserCode);

        const string View_ = "~/Views/Production/WarehouseTransfer/Numbering/WHTNumbering.cshtml";

        [Route("production/setup/warehouse-transfer-numbering")]
        public IActionResult WHTNumbering()
        {
            return View(View_, LoadPage());
        }

        WarehouseTransferNumberPage_DTO LoadPage()
        {
            var m = new WarehouseTransferNumberPage_DTO();
            DataSet ds = DAO.WarehouseTransferNumberingDB(1, new WarehouseTransferNumbering_DTO { CreatorCode = CreatorCode });

            ViewBag.Method = Help.GetCat(ds.Tables[0]);
            ViewBag.Frequency = Help.GetCat(ds.Tables[1]);
            ViewBag.Prefil = Help.GetCat(ds.Tables[2]);

            if (ds.Tables[3].Rows.Count > 0)
            {
                m.WHTN_Number = Convert.ToInt64(ds.Tables[3].Rows[0]["WHTN_Number"]);
                m.WHTN_Method = ds.Tables[3].Rows[0]["WHTN_Method"].ToString();
            }

            m.WHT_NumberReset = DL.WHTRList(ds.Tables[4]);
            m.WHT_NumberPrefix = DL.WHTPList(ds.Tables[5]);
            m.WHT_NumberSuffix = DL.WHTSList(ds.Tables[6]);
            return m;
        }

        static int YMD(string? s)
            => Convert.ToInt32(Convert.ToDateTime(s).ToString("yyyyMMdd"));

        void Run(int id, WarehouseTransferNumbering_DTO f)
        {
            f.CreatorCode = CreatorCode;
            DAO.WarehouseTransferNumberingDB(id, f);
        }

        [Route("production/setup/warehouse-transfer-numbering")]
        [HttpPost]
        public IActionResult WHTNumbering(WarehouseTransferNumberPage_DTO PN)
        {
            var reset = (PN.WHT_NumberReset ?? new()).Where(k => !k.WHTR_IsDeleted).ToList();
            var prefix = (PN.WHT_NumberPrefix ?? new()).Where(k => !k.WHTP_IsDeleted).ToList();
            var suffix = (PN.WHT_NumberSuffix ?? new()).Where(k => !k.WHTS_IsDeleted).ToList();

            long method = string.IsNullOrEmpty(PN.WHTN_Method) ? 0 : Convert.ToInt64(PN.WHTN_Method);
            PN.WHTN_Method = "2";
            if (PN.WHTN_Method == "2")
            {
                // remove rows deleted on the page (keep only the listed numbers)
                Run(31, new WarehouseTransferNumbering_DTO { DeleteNumbers = string.Join(", ", reset.Where(x => x.WHTR_Number != 0).Select(x => x.WHTR_Number)) });
                Run(32, new WarehouseTransferNumbering_DTO { DeleteNumbers = string.Join(", ", prefix.Where(x => x.WHTP_Number != 0).Select(x => x.WHTP_Number)) });
                Run(33, new WarehouseTransferNumbering_DTO { DeleteNumbers = string.Join(", ", suffix.Where(x => x.WHTS_Number != 0).Select(x => x.WHTS_Number)) });

                // method row
                Run(PN.WHTN_Number == 0 ? 11 : 41,
                    new WarehouseTransferNumbering_DTO { WHTN_Number = PN.WHTN_Number, WHTN_Method = method });

                foreach (var r in reset)
                    Run(r.WHTR_Number == 0 ? 12 : 42, new WarehouseTransferNumbering_DTO
                    {
                        WHTN_Number = r.WHTR_Number,
                        WHTN_Date = YMD(r.WHTR_Date),
                        WHTN_EndDate = YMD(r.WHTR_EndDate),
                        WHTN_StartingNumber = r.WHTR_StartingNumber,
                        WHTN_NumberofDigits = r.WHTR_NumberofDigits,
                        WHTN_PrefilZero = r.WHTR_PrefilZero,
                        WHTN_Frequency = r.WHTR_Frequency
                    });

                foreach (var p in prefix)
                    Run(p.WHTP_Number == 0 ? 13 : 43, new WarehouseTransferNumbering_DTO
                    {
                        WHTN_Number = p.WHTP_Number,
                        WHTN_Date = YMD(p.WHTP_Date),
                        WHTN_EndDate = YMD(p.WHTP_EndDate),
                        WHTN_Particulars = p.WHTP_Particulars
                    });

                foreach (var s in suffix)
                    Run(s.WHTS_Number == 0 ? 14 : 44, new WarehouseTransferNumbering_DTO
                    {
                        WHTN_Number = s.WHTS_Number,
                        WHTN_Date = YMD(s.WHTS_Date),
                        WHTN_EndDate = YMD(s.WHTS_EndDate),
                        WHTN_Particulars = s.WHTS_Particulars
                    });

                ModelState.Clear();
            }

            return View(View_, LoadPage());
        }

        // ---- overlap checks ----
        JsonResult CheckRange(int id, string label, string StartDate, string EndDate)
        {
            var dto = new WarehouseTransferNumbering_DTO
            {
                WHTN_Date = int.Parse(DateTime.ParseExact(StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture).ToString("yyyyMMdd")),
                WHTN_EndDate = int.Parse(DateTime.ParseExact(EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture).ToString("yyyyMMdd")),
                CreatorCode = CreatorCode
            };

            DataSet ds = DAO.WarehouseTransferNumberingDB(id, dto);
            bool exists = Convert.ToInt32(ds.Tables[0].Rows[0]["ExistsFlag"]) == 1;

            return Json(new
            {
                success = !exists,
                message = exists ? "The selected " + label + "date range overlaps with an existing date range." : ""
            });
        }

        [HttpPost]
        public JsonResult ValidateDateRange(string StartDate, string EndDate)
            => CheckRange(51, "", StartDate, EndDate);

        [HttpPost]
        public JsonResult ValidatePrefixDateRange(string StartDate, string EndDate)
            => CheckRange(52, "Prefix ", StartDate, EndDate);

        [HttpPost]
        public JsonResult ValidateSuffixDateRange(string StartDate, string EndDate)
            => CheckRange(53, "Suffix ", StartDate, EndDate);
    }
}