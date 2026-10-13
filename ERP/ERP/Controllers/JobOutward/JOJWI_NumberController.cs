using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobworkOutward
{
    public class JOJWI_NumberController : Controller
    {
        Help Help = new Help();

        JOJWI_Numbering_DAO JN_DAO = new JOJWI_Numbering_DAO();
        JOJWI_Numbering_DL JN_DL = new JOJWI_Numbering_DL();

        const string ViewPath = "~/Views/JobworkOutward/JO_JobworkInvoice/JOJWI_Number/JOJWI_Numbering.cshtml";

        int UserCode => int.TryParse(User.FindFirst("ERP_ID")?.Value, out var n) ? n : 0;

        static string Ymd(string? s)
        {
            string[] fmts = { "dd-MMM-yyyy", "dd MMM yyyy" };
            return DateTime.ParseExact((s ?? "").Trim(), fmts, CultureInfo.InvariantCulture, DateTimeStyles.None)
                           .ToString("yyyyMMdd");
        }

        // ---------------------------------------------------------------- setup page
        [HttpGet]
        [Route("joboutward/setup/jo-jobwork-invoice-numbering")]
        public IActionResult JOJWI_Numbering()
        {
            return View(ViewPath, LoadPage());
        }

        JOJWI_Numbering_DTO LoadPage()
        {
            JOJWI_Numbering_DTO dto = new JOJWI_Numbering_DTO();
            dto.CreatorCode = UserCode;
            dto.Id = 1;

            DataSet ds = JN_DAO.JOJWI_NumberingDB(dto);

            ViewBag.Frequency = Help.GetCat(ds.Tables[1]);
            ViewBag.Prefil = Help.GetCat(ds.Tables[2]);

            if (ds.Tables[3].Rows.Count > 0)
            {
                dto.JOJWI_Number = Convert.ToInt64(ds.Tables[3].Rows[0]["JOJWI_Number"]);
                dto.JOJWI_Method = ds.Tables[3].Rows[0]["JOJWI_Method"].ToString();
            }

            dto.JOJWI_NumberReset = JN_DL.JOJWI_NRSList(ds.Tables[4]);
            dto.JOJWI_NumberPrefix = JN_DL.JOJWI_PFXList(ds.Tables[5]);
            dto.JOJWI_NumberSuffix = JN_DL.JOJWI_SFXList(ds.Tables[6]);

            return dto;
        }

        [HttpPost]
        [Route("joboutward/setup/jo-jobwork-invoice-numbering")]
        public IActionResult JOJWI_NumberingPost(JOJWI_Numbering_DTO PN_DTO)
        {
            try
            {
                var Reset_DTO = (PN_DTO.JOJWI_NumberReset ?? new List<JOJWI_NumberReset_DTO>())
                                    .Where(K => !K.JOJWI_NRS_IsDeleted).ToList();
                var Prefix_DTO = (PN_DTO.JOJWI_NumberPrefix ?? new List<JOJWI_NumberPrefix_DTO>())
                                    .Where(K => !K.JOJWI_PFX_IsDeleted).ToList();
                var Suffix_DTO = (PN_DTO.JOJWI_NumberSuffix ?? new List<JOJWI_NumberSuffix_DTO>())
                                    .Where(K => !K.JOJWI_SFX_IsDeleted).ToList();

                JOJWI_Numbering_DTO D = new JOJWI_Numbering_DTO();
                D.CreatorCode = UserCode;
                D.JOJWI_Method = "2";   // MAX+1 method only

                // delete rows removed on the page (kept ids are passed, the SP deletes the rest)
                D.DeleteNumbers = string.Join(", ", Reset_DTO.Where(x => x.JOJWI_NRS_Number != 0).Select(x => x.JOJWI_NRS_Number));
                D.Id = 31;
                JN_DAO.JOJWI_NumberingDB(D);

                D.DeleteNumbers = string.Join(", ", Prefix_DTO.Where(x => x.JOJWI_PFX_Number != 0).Select(x => x.JOJWI_PFX_Number));
                D.Id = 32;
                JN_DAO.JOJWI_NumberingDB(D);

                D.DeleteNumbers = string.Join(", ", Suffix_DTO.Where(x => x.JOJWI_SFX_Number != 0).Select(x => x.JOJWI_SFX_Number));
                D.Id = 33;
                JN_DAO.JOJWI_NumberingDB(D);

                // method (head)
                if (PN_DTO.JOJWI_Number == 0)
                {
                    D.Id = 11;
                }
                else
                {
                    D.Id = 41;
                    D.JOJWI_Number = PN_DTO.JOJWI_Number;
                }
                JN_DAO.JOJWI_NumberingDB(D);

                // number (reset) rows
                foreach (var R in Reset_DTO)
                {
                    D.JOJWI_Date = Ymd(R.JOJWI_NRS_StartDate);
                    D.JOJWI_EndDate = Ymd(R.JOJWI_NRS_EndDate);
                    D.JOJWI_StartingNumber = Convert.ToInt32(R.JOJWI_NRS_StartingNumber).ToString();
                    D.JOJWI_NumberofDigits = Convert.ToInt32(R.JOJWI_NRS_NumberofDigits).ToString();
                    D.JOJWI_PrefilZero = Convert.ToInt64(R.JOJWI_NRS_PrefilZero).ToString();
                    D.JOJWI_Frequency = Convert.ToInt64(R.JOJWI_NRS_Frequency).ToString();

                    if (R.JOJWI_NRS_Number == 0)
                    {
                        D.Id = 12;
                    }
                    else
                    {
                        D.Id = 42;
                        D.JOJWI_Number = R.JOJWI_NRS_Number;
                    }
                    JN_DAO.JOJWI_NumberingDB(D);
                }

                // prefix rows
                foreach (var P in Prefix_DTO)
                {
                    D.JOJWI_Date = Ymd(P.JOJWI_PFX_StartDate);
                    D.JOJWI_EndDate = Ymd(P.JOJWI_PFX_EndDate);
                    D.JOJWI_Particulars = P.JOJWI_PFX_Particulars;

                    if (P.JOJWI_PFX_Number == 0)
                    {
                        D.Id = 13;
                    }
                    else
                    {
                        D.Id = 43;
                        D.JOJWI_Number = P.JOJWI_PFX_Number;
                    }
                    JN_DAO.JOJWI_NumberingDB(D);
                }

                // suffix rows
                foreach (var S in Suffix_DTO)
                {
                    D.JOJWI_Date = Ymd(S.JOJWI_SFX_StartDate);
                    D.JOJWI_EndDate = Ymd(S.JOJWI_SFX_EndDate);
                    D.JOJWI_Particulars = S.JOJWI_SFX_Particulars;

                    if (S.JOJWI_SFX_Number == 0)
                    {
                        D.Id = 14;
                    }
                    else
                    {
                        D.Id = 44;
                        D.JOJWI_Number = S.JOJWI_SFX_Number;
                    }
                    JN_DAO.JOJWI_NumberingDB(D);
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
        [Route("joboutward/setup/jo-jobwork-invoice-numbering/validate-date-range")]
        public JsonResult ValidateDateRange(string StartDate, string EndDate)
        {
            return CheckOverlap(StartDate, EndDate, 51, "");
        }

        [HttpPost]
        [Route("joboutward/setup/jo-jobwork-invoice-numbering/validate-prefix-date-range")]
        public JsonResult ValidatePrefixDateRange(string StartDate, string EndDate)
        {
            return CheckOverlap(StartDate, EndDate, 52, "Prefix ");
        }

        [HttpPost]
        [Route("joboutward/setup/jo-jobwork-invoice-numbering/validate-suffix-date-range")]
        public JsonResult ValidateSuffixDateRange(string StartDate, string EndDate)
        {
            return CheckOverlap(StartDate, EndDate, 53, "Suffix ");
        }

        JsonResult CheckOverlap(string StartDate, string EndDate, int Id, string label)
        {
            JOJWI_Numbering_DTO dto = new JOJWI_Numbering_DTO();
            dto.JOJWI_Date = Ymd(StartDate);
            dto.JOJWI_EndDate = Ymd(EndDate);
            dto.Id = Id;

            DataSet ds = JN_DAO.JOJWI_NumberingDB(dto);
            bool exists = Convert.ToInt32(ds.Tables[0].Rows[0]["ExistsFlag"]) == 1;

            return Json(new
            {
                success = !exists,
                message = exists ? "The selected " + label + "date range overlaps with an existing date range." : ""
            });
        }

        // ---------------------------------------------------------------- next Journal No (used by the invoice page)
        [HttpGet]
        [Route("joboutward/transactions/jobwork-invoice/next-journal-no")]
        public JsonResult NextJournalNo(DateTime journalDate)
        {
            try
            {
                return Json(new { success = true, number = JN_DAO.JOJWI_NextJournalNo(journalDate) });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "Journal No is not configured for the selected Journal Date." });
            }
        }
    }
}