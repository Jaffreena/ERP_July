using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobworkOutward
{
    public class JOFTI_NumberController : Controller
    {
        Help Help = new Help();

        JOFTI_Numbering_DAO FN_DAO = new JOFTI_Numbering_DAO();
        JOFTI_Numbering_DL FN_DL = new JOFTI_Numbering_DL();

        const string ViewPath = "~/Views/JobworkOutward/JO_FreightInvoice/JOFTI_Number/JOFTI_Numbering.cshtml";

        int UserCode => int.TryParse(User.FindFirst("ERP_ID")?.Value, out var n) ? n : 0;

        static string Ymd(string? s)
        {
            string[] fmts = { "dd-MMM-yyyy", "dd MMM yyyy" };
            return DateTime.ParseExact((s ?? "").Trim(), fmts, CultureInfo.InvariantCulture, DateTimeStyles.None)
                           .ToString("yyyyMMdd");
        }

        // ---------------------------------------------------------------- setup page
        [HttpGet]
        [Route("joboutward/setup/jo-freight-invoice-numbering")]
        public IActionResult JOFTI_Numbering()
        {
            return View(ViewPath, LoadPage());
        }

        JOFTI_Numbering_DTO LoadPage()
        {
            JOFTI_Numbering_DTO dto = new JOFTI_Numbering_DTO();
            dto.CreatorCode = UserCode;
            dto.Id = 1;

            DataSet ds = FN_DAO.JOFTI_NumberingDB(dto);

            ViewBag.Frequency = Help.GetCat(ds.Tables[1]);
            ViewBag.Prefil = Help.GetCat(ds.Tables[2]);

            if (ds.Tables[3].Rows.Count > 0)
            {
                dto.JOFTI_Number = Convert.ToInt64(ds.Tables[3].Rows[0]["JOFTI_Number"]);
                dto.JOFTI_Method = ds.Tables[3].Rows[0]["JOFTI_Method"].ToString();
            }

            dto.JOFTI_NumberReset = FN_DL.JOFTI_NRSList(ds.Tables[4]);
            dto.JOFTI_NumberPrefix = FN_DL.JOFTI_PFXList(ds.Tables[5]);
            dto.JOFTI_NumberSuffix = FN_DL.JOFTI_SFXList(ds.Tables[6]);

            return dto;
        }

        [HttpPost]
        [Route("joboutward/setup/jo-freight-invoice-numbering")]
        public IActionResult JOFTI_NumberingPost(JOFTI_Numbering_DTO PN_DTO)
        {
            try
            {
                var Reset_DTO = (PN_DTO.JOFTI_NumberReset ?? new List<JOFTI_NumberReset_DTO>())
                                    .Where(K => !K.JOFTI_NRS_IsDeleted).ToList();
                var Prefix_DTO = (PN_DTO.JOFTI_NumberPrefix ?? new List<JOFTI_NumberPrefix_DTO>())
                                    .Where(K => !K.JOFTI_PFX_IsDeleted).ToList();
                var Suffix_DTO = (PN_DTO.JOFTI_NumberSuffix ?? new List<JOFTI_NumberSuffix_DTO>())
                                    .Where(K => !K.JOFTI_SFX_IsDeleted).ToList();

                JOFTI_Numbering_DTO D = new JOFTI_Numbering_DTO();
                D.CreatorCode = UserCode;
                D.JOFTI_Method = "2";   // MAX+1 method only

                // delete rows removed on the page (kept ids are passed, the SP deletes the rest)
                D.DeleteNumbers = string.Join(", ", Reset_DTO.Where(x => x.JOFTI_NRS_Number != 0).Select(x => x.JOFTI_NRS_Number));
                D.Id = 31;
                FN_DAO.JOFTI_NumberingDB(D);

                D.DeleteNumbers = string.Join(", ", Prefix_DTO.Where(x => x.JOFTI_PFX_Number != 0).Select(x => x.JOFTI_PFX_Number));
                D.Id = 32;
                FN_DAO.JOFTI_NumberingDB(D);

                D.DeleteNumbers = string.Join(", ", Suffix_DTO.Where(x => x.JOFTI_SFX_Number != 0).Select(x => x.JOFTI_SFX_Number));
                D.Id = 33;
                FN_DAO.JOFTI_NumberingDB(D);

                // method (head)
                if (PN_DTO.JOFTI_Number == 0)
                {
                    D.Id = 11;
                }
                else
                {
                    D.Id = 41;
                    D.JOFTI_Number = PN_DTO.JOFTI_Number;
                }
                FN_DAO.JOFTI_NumberingDB(D);

                // number (reset) rows
                foreach (var R in Reset_DTO)
                {
                    D.JOFTI_Date = Ymd(R.JOFTI_NRS_StartDate);
                    D.JOFTI_EndDate = Ymd(R.JOFTI_NRS_EndDate);
                    D.JOFTI_StartingNumber = Convert.ToInt32(R.JOFTI_NRS_StartingNumber).ToString();
                    D.JOFTI_NumberofDigits = Convert.ToInt32(R.JOFTI_NRS_NumberofDigits).ToString();
                    D.JOFTI_PrefilZero = Convert.ToInt64(R.JOFTI_NRS_PrefilZero).ToString();
                    D.JOFTI_Frequency = Convert.ToInt64(R.JOFTI_NRS_Frequency).ToString();

                    if (R.JOFTI_NRS_Number == 0)
                    {
                        D.Id = 12;
                    }
                    else
                    {
                        D.Id = 42;
                        D.JOFTI_Number = R.JOFTI_NRS_Number;
                    }
                    FN_DAO.JOFTI_NumberingDB(D);
                }

                // prefix rows
                foreach (var P in Prefix_DTO)
                {
                    D.JOFTI_Date = Ymd(P.JOFTI_PFX_StartDate);
                    D.JOFTI_EndDate = Ymd(P.JOFTI_PFX_EndDate);
                    D.JOFTI_Particulars = P.JOFTI_PFX_Particulars;

                    if (P.JOFTI_PFX_Number == 0)
                    {
                        D.Id = 13;
                    }
                    else
                    {
                        D.Id = 43;
                        D.JOFTI_Number = P.JOFTI_PFX_Number;
                    }
                    FN_DAO.JOFTI_NumberingDB(D);
                }

                // suffix rows
                foreach (var S in Suffix_DTO)
                {
                    D.JOFTI_Date = Ymd(S.JOFTI_SFX_StartDate);
                    D.JOFTI_EndDate = Ymd(S.JOFTI_SFX_EndDate);
                    D.JOFTI_Particulars = S.JOFTI_SFX_Particulars;

                    if (S.JOFTI_SFX_Number == 0)
                    {
                        D.Id = 14;
                    }
                    else
                    {
                        D.Id = 44;
                        D.JOFTI_Number = S.JOFTI_SFX_Number;
                    }
                    FN_DAO.JOFTI_NumberingDB(D);
                }
            }
            catch (Exception ex)
            {
                ViewBag.Error = ex.Message;
            }

            ModelState.Clear();
            return View(ViewPath, LoadPage());
        }

        // ---------------------------------------------------------------- overlap checks
        [HttpPost]
        [Route("joboutward/setup/jo-freight-invoice-numbering/validate-date-range")]
        public JsonResult ValidateDateRange(string StartDate, string EndDate)
        {
            return CheckOverlap(StartDate, EndDate, 51, "");
        }

        [HttpPost]
        [Route("joboutward/setup/jo-freight-invoice-numbering/validate-prefix-date-range")]
        public JsonResult ValidatePrefixDateRange(string StartDate, string EndDate)
        {
            return CheckOverlap(StartDate, EndDate, 52, "Prefix ");
        }

        [HttpPost]
        [Route("joboutward/setup/jo-freight-invoice-numbering/validate-suffix-date-range")]
        public JsonResult ValidateSuffixDateRange(string StartDate, string EndDate)
        {
            return CheckOverlap(StartDate, EndDate, 53, "Suffix ");
        }

        JsonResult CheckOverlap(string StartDate, string EndDate, int Id, string label)
        {
            JOFTI_Numbering_DTO dto = new JOFTI_Numbering_DTO();
            dto.JOFTI_Date = Ymd(StartDate);
            dto.JOFTI_EndDate = Ymd(EndDate);
            dto.Id = Id;

            DataSet ds = FN_DAO.JOFTI_NumberingDB(dto);
            bool exists = Convert.ToInt32(ds.Tables[0].Rows[0]["ExistsFlag"]) == 1;

            return Json(new
            {
                success = !exists,
                message = exists ? "The selected " + label + "date range overlaps with an existing date range." : ""
            });
        }

        // ---------------------------------------------------------------- next Journal No (used by the invoice page)
        [HttpGet]
        [Route("joboutward/transactions/jo-freight-invoice/next-journal-no")]
        public JsonResult NextJournalNo(DateTime journalDate)
        {
            try
            {
                return Json(new { success = true, number = FN_DAO.JOFTI_NextJournalNo(journalDate) });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "Journal No is not configured for the selected Journal Date." });
            }
        }
    }
}