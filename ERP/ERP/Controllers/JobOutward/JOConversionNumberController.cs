using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobOutward
{
    public class JOConversionNumberController : Controller
    {
        Help Help = new Help();
        JO_Conversion_DAO DAO = new JO_Conversion_DAO();
        JO_Conversion_DL DL = new JO_Conversion_DL();

        public Int64 UserCode => Int64.TryParse(User.FindFirst("ERP_ID")?.Value, out var No) ? No : 0;
        int CreatorCode => Convert.ToInt32(UserCode);

        const string View_ = "~/Views/JobworkOutward/JO_Conversion/ConversionNumber/JOCNVNumbering.cshtml";

        [Route("joboutward/setup/conversion-numbering")]
        public IActionResult JOCNVNumbering()
        {
            return View(View_, LoadPage());
        }

        JOConversionNumberPage_DTO LoadPage()
        {
            var m = new JOConversionNumberPage_DTO();
            DataSet ds = DAO.JOConversionNumberingDB(1, new JOConversionNumbering_DTO { CreatorCode = CreatorCode });

            ViewBag.Method = Help.GetCat(ds.Tables[0]);
            ViewBag.Frequency = Help.GetCat(ds.Tables[1]);
            ViewBag.Prefil = Help.GetCat(ds.Tables[2]);

            if (ds.Tables[3].Rows.Count > 0)
            {
                m.JOCN_Number = Convert.ToInt64(ds.Tables[3].Rows[0]["JOCN_Number"]);
                m.JOCN_Method = ds.Tables[3].Rows[0]["JOCN_Method"].ToString();
            }

            m.JOCNV_NumberReset = DL.JOCRList(ds.Tables[4]);
            m.JOCNV_NumberPrefix = DL.JOCPList(ds.Tables[5]);
            m.JOCNV_NumberSuffix = DL.JOCSList(ds.Tables[6]);
            return m;
        }

        static int YMD(string? s)
            => Convert.ToInt32(Convert.ToDateTime(s).ToString("yyyyMMdd"));

        void Run(int id, JOConversionNumbering_DTO f)
        {
            f.CreatorCode = CreatorCode;
            DAO.JOConversionNumberingDB(id, f);
        }

        [Route("joboutward/setup/conversion-numbering")]
        [HttpPost]
        public IActionResult JOCNVNumbering(JOConversionNumberPage_DTO PN)
        {
            var reset = (PN.JOCNV_NumberReset ?? new()).Where(k => !k.JOCR_IsDeleted).ToList();
            var prefix = (PN.JOCNV_NumberPrefix ?? new()).Where(k => !k.JOCP_IsDeleted).ToList();
            var suffix = (PN.JOCNV_NumberSuffix ?? new()).Where(k => !k.JOCS_IsDeleted).ToList();

            long method = string.IsNullOrEmpty(PN.JOCN_Method) ? 0 : Convert.ToInt64(PN.JOCN_Method);
            PN.JOCN_Method = "2";
            if (PN.JOCN_Method == "2")
            {
                // remove rows deleted on the page (keep only the listed numbers)
                Run(31, new JOConversionNumbering_DTO { DeleteNumbers = string.Join(", ", reset.Where(x => x.JOCR_Number != 0).Select(x => x.JOCR_Number)) });
                Run(32, new JOConversionNumbering_DTO { DeleteNumbers = string.Join(", ", prefix.Where(x => x.JOCP_Number != 0).Select(x => x.JOCP_Number)) });
                Run(33, new JOConversionNumbering_DTO { DeleteNumbers = string.Join(", ", suffix.Where(x => x.JOCS_Number != 0).Select(x => x.JOCS_Number)) });

                // method row
                Run(PN.JOCN_Number == 0 ? 11 : 41,
                    new JOConversionNumbering_DTO { JOCN_Number = PN.JOCN_Number, JOCN_Method = method });

                foreach (var r in reset)
                    Run(r.JOCR_Number == 0 ? 12 : 42, new JOConversionNumbering_DTO
                    {
                        JOCN_Number = r.JOCR_Number,
                        JOCN_Date = YMD(r.JOCR_Date),
                        JOCN_EndDate = YMD(r.JOCR_EndDate),
                        JOCN_StartingNumber = r.JOCR_StartingNumber,
                        JOCN_NumberofDigits = r.JOCR_NumberofDigits,
                        JOCN_PrefilZero = r.JOCR_PrefilZero,
                        JOCN_Frequency = r.JOCR_Frequency
                    });

                foreach (var p in prefix)
                    Run(p.JOCP_Number == 0 ? 13 : 43, new JOConversionNumbering_DTO
                    {
                        JOCN_Number = p.JOCP_Number,
                        JOCN_Date = YMD(p.JOCP_Date),
                        JOCN_EndDate = YMD(p.JOCP_EndDate),
                        JOCN_Particulars = p.JOCP_Particulars
                    });

                foreach (var s in suffix)
                    Run(s.JOCS_Number == 0 ? 14 : 44, new JOConversionNumbering_DTO
                    {
                        JOCN_Number = s.JOCS_Number,
                        JOCN_Date = YMD(s.JOCS_Date),
                        JOCN_EndDate = YMD(s.JOCS_EndDate),
                        JOCN_Particulars = s.JOCS_Particulars
                    });

                ModelState.Clear();
            }
            else if (PN.JOCN_Method == "3")
            {
                Run(PN.JOCN_Number == 0 ? 21 : 22,
                    new JOConversionNumbering_DTO { JOCN_Number = PN.JOCN_Number, JOCN_Method = method });
                ModelState.Clear();
            }

            return View(View_, LoadPage());
        }

        // ---- overlap checks ----
        JsonResult CheckRange(int id, string label, string StartDate, string EndDate)
        {
            var dto = new JOConversionNumbering_DTO
            {
                JOCN_Date = int.Parse(DateTime.ParseExact(StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture).ToString("yyyyMMdd")),
                JOCN_EndDate = int.Parse(DateTime.ParseExact(EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture).ToString("yyyyMMdd")),
                CreatorCode = CreatorCode
            };

            DataSet ds = DAO.JOConversionNumberingDB(id, dto);
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
