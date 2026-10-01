using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DL;
using ERP_DTO;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobOutward
{
    public class JOJWI_SVO_NumberController : Controller
    {
        DataSet DS = new DataSet();
        Help Help = new Help();

        JOJWI_SVO_Numbering_DTO SON_DTO = new JOJWI_SVO_Numbering_DTO();
        JO_ServiceOrder_DAO SON_DAO = new JO_ServiceOrder_DAO();
        JO_ServiceOrder_DL SON_DL = new JO_ServiceOrder_DL();

        private const string ViewPath = "~/Views/JobworkOutward/JO_ServiceOrder/JOJWI_SVO_Number/JOJWI_SVO_Numbering.cshtml";

        [Route("joboutward/setup/jojwi-serviceorder-numbering")]
        public IActionResult JOJWI_SVO_Numbering()
        {
            GetJOJWI_SVO_Number();
            return View(ViewPath, SON_DTO);
        }

        void GetJOJWI_SVO_Number()
        {
            SON_DTO.CreatorCode = 1;
            SON_DTO.Id = 1;
            DS = SON_DAO.JOJWI_SVO_NumberingDB(SON_DTO);

            ViewBag.Method = Help.GetCat(DS.Tables[0]);
            ViewBag.Frequency = Help.GetCat(DS.Tables[1]);
            ViewBag.Prefil = Help.GetCat(DS.Tables[2]);

            if (DS.Tables[3].Rows.Count > 0)
            {
                SON_DTO.JOJWI_SVO_Number = Convert.ToInt64(DS.Tables[3].Rows[0]["JOJWI_SVO_Number"]);
                SON_DTO.JOJWI_SVO_Method = DS.Tables[3].Rows[0]["JOJWI_SVO_Method"].ToString();
            }

            SON_DTO.JOJWI_SVO_NumberReset = SON_DL.JOJWI_SVO_NRSList(DS.Tables[4]);
            SON_DTO.JOJWI_SVO_NumberPrefix = SON_DL.JOJWI_SVO_PFXList(DS.Tables[5]);
            SON_DTO.JOJWI_SVO_NumberSuffix = SON_DL.JOJWI_SVO_SFXList(DS.Tables[6]);
        }

        [Route("joboutward/setup/jojwi-serviceorder-numbering")]
        [HttpPost]
        public IActionResult JOJWI_SVO_NumberingPost(JOJWI_SVO_Numbering_DTO PN_DTO)
        {
            var Reset_DTO = new List<JOJWI_SVO_NumberReset_DTO>();
            var Prefix_DTO = new List<JOJWI_SVO_NumberPrefix_DTO>();
            var Suffix_DTO = new List<JOJWI_SVO_NumberSuffix_DTO>();

            if (PN_DTO.JOJWI_SVO_NumberReset != null)
                Reset_DTO = PN_DTO.JOJWI_SVO_NumberReset.Where(K => !K.JOJWI_SVO_NRS_IsDeleted).ToList();
            if (PN_DTO.JOJWI_SVO_NumberPrefix != null)
                Prefix_DTO = PN_DTO.JOJWI_SVO_NumberPrefix.Where(K => !K.JOJWI_SVO_PFX_IsDeleted).ToList();
            if (PN_DTO.JOJWI_SVO_NumberSuffix != null)
                Suffix_DTO = PN_DTO.JOJWI_SVO_NumberSuffix.Where(K => !K.JOJWI_SVO_SFX_IsDeleted).ToList();

            PN_DTO.JOJWI_SVO_Method = "2";

            string ResetIds = string.Join(", ", Reset_DTO.Where(x => x.JOJWI_SVO_NRS_Number != 0).Select(x => x.JOJWI_SVO_NRS_Number));
            string PrefixIds = string.Join(", ", Prefix_DTO.Where(x => x.JOJWI_SVO_PFX_Number != 0).Select(x => x.JOJWI_SVO_PFX_Number));
            string SuffixIds = string.Join(", ", Suffix_DTO.Where(x => x.JOJWI_SVO_SFX_Number != 0).Select(x => x.JOJWI_SVO_SFX_Number));

            SON_DTO.CreatorCode = 1;

            SON_DTO.DeleteNumbers = ResetIds;
            SON_DTO.Id = 31;
            SON_DAO.JOJWI_SVO_NumberingDB(SON_DTO);

            SON_DTO.DeleteNumbers = PrefixIds;
            SON_DTO.Id = 32;
            SON_DAO.JOJWI_SVO_NumberingDB(SON_DTO);

            SON_DTO.DeleteNumbers = SuffixIds;
            SON_DTO.Id = 33;
            SON_DAO.JOJWI_SVO_NumberingDB(SON_DTO);

            SON_DTO.JOJWI_SVO_Method = PN_DTO.JOJWI_SVO_Method;
            if (PN_DTO.JOJWI_SVO_Number == 0)
            {
                SON_DTO.Id = 11;
            }
            else
            {
                SON_DTO.Id = 41;
                SON_DTO.JOJWI_SVO_Number = PN_DTO.JOJWI_SVO_Number;
            }
            SON_DAO.JOJWI_SVO_NumberingDB(SON_DTO);

            foreach (var Reset in Reset_DTO)
            {
                SON_DTO.JOJWI_SVO_Date = Convert.ToDateTime(Reset.JOJWI_SVO_NRS_StartDate).ToString("yyyyMMdd");
                SON_DTO.JOJWI_SVO_EndDate = Convert.ToDateTime(Reset.JOJWI_SVO_NRS_EndDate).ToString("yyyyMMdd");
                SON_DTO.JOJWI_SVO_StartingNumber = Convert.ToInt32(Reset.JOJWI_SVO_NRS_StartingNumber).ToString();
                SON_DTO.JOJWI_SVO_NumberofDigits = Convert.ToInt32(Reset.JOJWI_SVO_NRS_NumberofDigits).ToString();
                SON_DTO.JOJWI_SVO_PrefilZero = Convert.ToInt64(Reset.JOJWI_SVO_NRS_PrefilZero).ToString();
                SON_DTO.JOJWI_SVO_Frequency = Convert.ToInt64(Reset.JOJWI_SVO_NRS_Frequency).ToString();

                if (Reset.JOJWI_SVO_NRS_Number == 0)
                {
                    SON_DTO.Id = 12;
                }
                else
                {
                    SON_DTO.Id = 42;
                    SON_DTO.JOJWI_SVO_Number = Reset.JOJWI_SVO_NRS_Number;
                }
                SON_DAO.JOJWI_SVO_NumberingDB(SON_DTO);
            }

            foreach (var Prefix in Prefix_DTO)
            {
                SON_DTO.JOJWI_SVO_Date = Convert.ToDateTime(Prefix.JOJWI_SVO_PFX_StartDate).ToString("yyyyMMdd");
                SON_DTO.JOJWI_SVO_EndDate = Convert.ToDateTime(Prefix.JOJWI_SVO_PFX_EndDate).ToString("yyyyMMdd");
                SON_DTO.JOJWI_SVO_Particulars = Convert.ToString(Prefix.JOJWI_SVO_PFX_Particulars);

                if (Prefix.JOJWI_SVO_PFX_Number == 0)
                {
                    SON_DTO.Id = 13;
                }
                else
                {
                    SON_DTO.Id = 43;
                    SON_DTO.JOJWI_SVO_Number = Prefix.JOJWI_SVO_PFX_Number;
                }
                SON_DAO.JOJWI_SVO_NumberingDB(SON_DTO);
            }

            foreach (var Suffix in Suffix_DTO)
            {
                SON_DTO.JOJWI_SVO_Date = Convert.ToDateTime(Suffix.JOJWI_SVO_SFX_StartDate).ToString("yyyyMMdd");
                SON_DTO.JOJWI_SVO_EndDate = Convert.ToDateTime(Suffix.JOJWI_SVO_SFX_EndDate).ToString("yyyyMMdd");
                SON_DTO.JOJWI_SVO_Particulars = Convert.ToString(Suffix.JOJWI_SVO_SFX_Particulars);

                if (Suffix.JOJWI_SVO_SFX_Number == 0)
                {
                    SON_DTO.Id = 14;
                }
                else
                {
                    SON_DTO.Id = 44;
                    SON_DTO.JOJWI_SVO_Number = Suffix.JOJWI_SVO_SFX_Number;
                }
                SON_DAO.JOJWI_SVO_NumberingDB(SON_DTO);
            }

            SON_DTO.Reset();
            ModelState.Clear();

            GetJOJWI_SVO_Number();
            return View(ViewPath, SON_DTO);
        }

        [HttpPost]
        public JsonResult ValidateDateRange(string StartDate, string EndDate)
        {
            return Json(CheckOverlap(StartDate, EndDate, 51, "The selected date range overlaps with an existing date range."));
        }

        [HttpPost]
        public JsonResult ValidatePrefixDateRange(string StartDate, string EndDate)
        {
            return Json(CheckOverlap(StartDate, EndDate, 52, "The selected Prefix date range overlaps with an existing date range."));
        }

        [HttpPost]
        public JsonResult ValidateSuffixDateRange(string StartDate, string EndDate)
        {
            return Json(CheckOverlap(StartDate, EndDate, 53, "The selected Suffix date range overlaps with an existing date range."));
        }

        private object CheckOverlap(string StartDate, string EndDate, int id, string msg)
        {
            var dto = new JOJWI_SVO_Numbering_DTO
            {
                JOJWI_SVO_Date = DateTime.ParseExact(StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture).ToString("yyyyMMdd"),
                JOJWI_SVO_EndDate = DateTime.ParseExact(EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture).ToString("yyyyMMdd"),
                Id = id
            };

            DataSet ds = SON_DAO.JOJWI_SVO_NumberingDB(dto);
            bool exists = Convert.ToInt32(ds.Tables[0].Rows[0]["ExistsFlag"]) == 1;

            return new { success = !exists, message = exists ? msg : "" };
        }
    }
}