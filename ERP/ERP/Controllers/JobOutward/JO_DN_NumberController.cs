using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobworkOutward
{
    public class JO_DN_NumberController : Controller
    {
        DataSet DS = new DataSet();
        Help Help = new Help();

        // JO DELIVERY NOTE NUMBERING
        JO_DNNumber_DTO DON_DTO = new JO_DNNumber_DTO();
        JO_DN_Numbering_DAO DON_DAO = new JO_DN_Numbering_DAO();
        JO_DN_Numbering_DL DON_DL = new JO_DN_Numbering_DL();

        const string ViewPath = "~/Views/JobworkOutward/DeliveryNote/DeliveryNoteNumber/DNNumbering.cshtml";

        [Route("joboutward/setup/delivery-note-numbering")]
        public IActionResult DNNumbering()
        {
            GetDNNumber();
            return View(ViewPath, DON_DTO);
        }

        void GetDNNumber()
        {
            DON_DTO.CreatorCode = Convert.ToInt32(1);
            DON_DTO.Id = 1;
            DS = DON_DAO.JO_DN_NumberingDB(DON_DTO);

            ViewBag.Method = Help.GetCat(DS.Tables[0]);
            ViewBag.Frequency = Help.GetCat(DS.Tables[1]);
            ViewBag.Prefil = Help.GetCat(DS.Tables[2]);

            if (DS.Tables[3].Rows.Count > 0)
            {
                DON_DTO.JODN_NM_Number = Convert.ToInt64(DS.Tables[3].Rows[0]["JODN_NM_Number"]);
                DON_DTO.JODN_NM_Method = DS.Tables[3].Rows[0]["JODN_NM_Method"].ToString();
            }

            DON_DTO.JODN_NumberReset = DON_DL.JODN_NRList(DS.Tables[4]);
            DON_DTO.JODN_NumberPrefix = DON_DL.JODN_PrefixList(DS.Tables[5]);
            DON_DTO.JODN_NumberSuffix = DON_DL.JODN_SuffixList(DS.Tables[6]);
        }

        [Route("joboutward/setup/delivery-note-numbering")]
        [HttpPost]
        public IActionResult DNNumbering(JO_DNNumber_DTO PN_DTO)
        {
            List<JODN_NumberReset_DTO>? Reset_DTO = new List<JODN_NumberReset_DTO>();
            List<JODN_NumberPrefix_DTO>? Prefix_DTO = new List<JODN_NumberPrefix_DTO>();
            List<JODN_NumberSuffix_DTO>? Suffix_DTO = new List<JODN_NumberSuffix_DTO>();

            if (PN_DTO.JODN_NumberReset != null)
                Reset_DTO = PN_DTO.JODN_NumberReset!.Where(K => !K.JODN_NR_IsDeleted).ToList();

            if (PN_DTO.JODN_NumberPrefix != null)
                Prefix_DTO = PN_DTO.JODN_NumberPrefix!.Where(K => !K.JODN_Prefix_IsDeleted).ToList();

            if (PN_DTO.JODN_NumberSuffix != null)
                Suffix_DTO = PN_DTO.JODN_NumberSuffix!.Where(K => !K.JODN_Suffix_IsDeleted).ToList();
            PN_DTO.JODN_NM_Method = "2";
            if (PN_DTO.JODN_NM_Method == "2")
            {
                String ResetDTO = string.Join(", ", Reset_DTO.Where(x => Convert.ToInt64(x.JODN_NR_Number) != 0).Select(x => x.JODN_NR_Number));
                String PrefixDTO = string.Join(", ", Prefix_DTO.Where(x => Convert.ToInt64(x.JODN_Prefix_Number) != 0).Select(x => x.JODN_Prefix_Number));
                String SuffixDTO = string.Join(", ", Suffix_DTO.Where(x => Convert.ToInt64(x.JODN_Suffix_Number) != 0).Select(x => x.JODN_Suffix_Number));

                // delete rows removed on the page (kept ids are passed, the SP deletes the rest)
                DON_DTO.CreatorCode = Convert.ToInt32(1);
                DON_DTO.DeleteNumbers = Convert.ToString(ResetDTO);
                DON_DTO.Id = 31;
                DON_DAO.JO_DN_NumberingDB(DON_DTO);

                DON_DTO.DeleteNumbers = Convert.ToString(PrefixDTO);
                DON_DTO.Id = 32;
                DON_DAO.JO_DN_NumberingDB(DON_DTO);

                DON_DTO.DeleteNumbers = Convert.ToString(SuffixDTO);
                DON_DTO.Id = 33;
                DON_DAO.JO_DN_NumberingDB(DON_DTO);

                // method (head)
                DON_DTO.JODN_NM_Method = PN_DTO.JODN_NM_Method;
                if (PN_DTO.JODN_NM_Number == 0)
                {
                    DON_DTO.Id = 11;
                }
                else
                {
                    DON_DTO.Id = 41;
                    DON_DTO.JODN_NM_Number = PN_DTO.JODN_NM_Number;
                }
                DON_DAO.JO_DN_NumberingDB(DON_DTO);

                // number (reset) rows
                foreach (var Reset in Reset_DTO)
                {
                    DON_DTO.JODN_NM_Date = Convert.ToString(Convert.ToDateTime(Reset.JODN_NR_Date).ToString("yyyyMMdd"));
                    DON_DTO.JODN_NM_EndDate = Convert.ToString(Convert.ToDateTime(Reset.JODN_NR_EndDate).ToString("yyyyMMdd"));
                    DON_DTO.JODN_NM_StartingNumber = Convert.ToInt32(Reset.JODN_NR_StartingNumber).ToString();
                    DON_DTO.JODN_NM_NumberofDigits = Convert.ToInt32(Reset.JODN_NR_NumberofDigits).ToString();
                    DON_DTO.JODN_NM_PrefilZero = Convert.ToInt64(Reset.JODN_NR_PrefilZero).ToString();
                    DON_DTO.JODN_NM_Frequency = Convert.ToInt64(Reset.JODN_NR_Frequency).ToString();

                    if (Reset.JODN_NR_Number == 0)
                    {
                        DON_DTO.Id = 12;
                    }
                    else
                    {
                        DON_DTO.Id = 42;
                        DON_DTO.JODN_NM_Number = Reset.JODN_NR_Number;
                    }

                    DON_DAO.JO_DN_NumberingDB(DON_DTO);
                }

                // prefix rows
                foreach (var Prefix in Prefix_DTO)
                {
                    DON_DTO.JODN_NM_Date = Convert.ToString(Convert.ToDateTime(Prefix.JODN_Prefix_Date).ToString("yyyyMMdd"));
                    DON_DTO.JODN_NM_EndDate = Convert.ToString(Convert.ToDateTime(Prefix.JODN_Prefix_EndDate).ToString("yyyyMMdd"));
                    DON_DTO.JODN_NM_Particulars = Convert.ToString(Prefix.JODN_Prefix_Particulars);

                    if (Prefix.JODN_Prefix_Number == 0)
                    {
                        DON_DTO.Id = 13;
                    }
                    else
                    {
                        DON_DTO.Id = 43;
                        DON_DTO.JODN_NM_Number = Prefix.JODN_Prefix_Number;
                    }

                    DON_DAO.JO_DN_NumberingDB(DON_DTO);
                }

                // suffix rows
                foreach (var Suffix in Suffix_DTO)
                {
                    DON_DTO.JODN_NM_Date = Convert.ToString(Convert.ToDateTime(Suffix.JODN_Suffix_Date).ToString("yyyyMMdd"));
                    DON_DTO.JODN_NM_EndDate = Convert.ToString(Convert.ToDateTime(Suffix.JODN_Suffix_EndDate).ToString("yyyyMMdd"));
                    DON_DTO.JODN_NM_Particulars = Convert.ToString(Suffix.JODN_Suffix_Particulars);

                    if (Suffix.JODN_Suffix_Number == 0)
                    {
                        DON_DTO.Id = 14;
                    }
                    else
                    {
                        DON_DTO.Id = 44;
                        DON_DTO.JODN_NM_Number = Suffix.JODN_Suffix_Number;
                    }

                    DON_DAO.JO_DN_NumberingDB(DON_DTO);
                }

                DON_DTO.Reset();
                Reset_DTO = null;
                Prefix_DTO = null;
                Suffix_DTO = null;
                ModelState.Clear();
            }
            else if (PN_DTO.JODN_NM_Method == "3")
            {
                DON_DTO.JODN_NM_Method = PN_DTO.JODN_NM_Method;

                if (PN_DTO.JODN_NM_Number == 0)
                {
                    DON_DTO.Id = 21;
                }
                else
                {
                    DON_DTO.Id = 22;
                    DON_DTO.JODN_NM_Number = PN_DTO.JODN_NM_Number;
                }

                DON_DAO.JO_DN_NumberingDB(DON_DTO);
            }

            GetDNNumber();
            return View(ViewPath, DON_DTO);
        }

        #region date range overlap checks
        static int ToYmd(string d)
        {
            return int.Parse(
                DateTime.ParseExact(d, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        .ToString("yyyyMMdd"));
        }

        JsonResult OverlapCheck(string StartDate, string EndDate, int Id, string label)
        {
            JO_DNNumber_DTO dto = new JO_DNNumber_DTO();

            dto.JODN_NM_Date = ToYmd(StartDate).ToString();
            dto.JODN_NM_EndDate = ToYmd(EndDate).ToString();
            dto.Id = Id;

            DataSet ds = DON_DAO.JO_DN_NumberingDB(dto);

            bool exists = Convert.ToInt32(ds.Tables[0].Rows[0]["ExistsFlag"]) == 1;

            return Json(new
            {
                success = !exists,
                message = exists
                    ? "The selected " + label + "date range overlaps with an existing date range."
                    : ""
            });
        }

        [HttpPost]
        [Route("joboutward/setup/delivery-note-numbering/validate-date-range")]
        public JsonResult ValidateDateRange(string StartDate, string EndDate)
        {
            return OverlapCheck(StartDate, EndDate, 51, "");
        }

        [HttpPost]
        [Route("joboutward/setup/delivery-note-numbering/validate-prefix-date-range")]
        public JsonResult ValidatePrefixDateRange(string StartDate, string EndDate)
        {
            return OverlapCheck(StartDate, EndDate, 52, "Prefix ");
        }

        [HttpPost]
        [Route("joboutward/setup/delivery-note-numbering/validate-suffix-date-range")]
        public JsonResult ValidateSuffixDateRange(string StartDate, string EndDate)
        {
            return OverlapCheck(StartDate, EndDate, 53, "Suffix ");
        }
        #endregion
    }
}