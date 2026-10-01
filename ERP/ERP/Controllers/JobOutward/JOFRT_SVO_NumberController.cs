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
    public class JOFRT_SVO_NumberController : Controller
    {
        DataSet DS = new DataSet();
        Help Help = new Help();

        JOFRT_SVO_Numbering_DTO SON_DTO = new JOFRT_SVO_Numbering_DTO();
        JO_ServiceOrder_DAO SON_DAO = new JO_ServiceOrder_DAO();
        JO_ServiceOrder_DL SON_DL = new JO_ServiceOrder_DL();

        private const string ViewPath = "~/Views/JobworkOutward/JO_ServiceOrder/JOFRT_SVO_Number/JOFRT_SVO_Numbering.cshtml";

        [Route("joboutward/setup/jofrt-serviceorder-numbering")]
        public IActionResult JOFRT_SVO_Numbering()
        {
            GetJOFRT_SVO_Number();
            return View(ViewPath, SON_DTO);
        }

        void GetJOFRT_SVO_Number()
        {
            SON_DTO.CreatorCode = 1;
            SON_DTO.Id = 1;
            DS = SON_DAO.JOFRT_SVO_NumberingDB(SON_DTO);

            ViewBag.Method = Help.GetCat(DS.Tables[0]);
            ViewBag.Frequency = Help.GetCat(DS.Tables[1]);
            ViewBag.Prefil = Help.GetCat(DS.Tables[2]);

            if (DS.Tables[3].Rows.Count > 0)
            {
                SON_DTO.JOFRT_SVO_Number = Convert.ToInt64(DS.Tables[3].Rows[0]["JOFRT_SVO_Number"]);
                SON_DTO.JOFRT_SVO_Method = DS.Tables[3].Rows[0]["JOFRT_SVO_Method"].ToString();
            }

            SON_DTO.JOFRT_SVO_NumberReset = SON_DL.JOFRT_SVO_NRSList(DS.Tables[4]);
            SON_DTO.JOFRT_SVO_NumberPrefix = SON_DL.JOFRT_SVO_PFXList(DS.Tables[5]);
            SON_DTO.JOFRT_SVO_NumberSuffix = SON_DL.JOFRT_SVO_SFXList(DS.Tables[6]);
        }

        [Route("joboutward/setup/jofrt-serviceorder-numbering")]
        [HttpPost]
        public IActionResult JOFRT_SVO_NumberingPost(JOFRT_SVO_Numbering_DTO PN_DTO)
        {
            var Reset_DTO = new List<JOFRT_SVO_NumberReset_DTO>();
            var Prefix_DTO = new List<JOFRT_SVO_NumberPrefix_DTO>();
            var Suffix_DTO = new List<JOFRT_SVO_NumberSuffix_DTO>();

            if (PN_DTO.JOFRT_SVO_NumberReset != null)
                Reset_DTO = PN_DTO.JOFRT_SVO_NumberReset.Where(K => !K.JOFRT_SVO_NRS_IsDeleted).ToList();
            if (PN_DTO.JOFRT_SVO_NumberPrefix != null)
                Prefix_DTO = PN_DTO.JOFRT_SVO_NumberPrefix.Where(K => !K.JOFRT_SVO_PFX_IsDeleted).ToList();
            if (PN_DTO.JOFRT_SVO_NumberSuffix != null)
                Suffix_DTO = PN_DTO.JOFRT_SVO_NumberSuffix.Where(K => !K.JOFRT_SVO_SFX_IsDeleted).ToList();

            PN_DTO.JOFRT_SVO_Method = "2";

            string ResetIds = string.Join(", ", Reset_DTO.Where(x => x.JOFRT_SVO_NRS_Number != 0).Select(x => x.JOFRT_SVO_NRS_Number));
            string PrefixIds = string.Join(", ", Prefix_DTO.Where(x => x.JOFRT_SVO_PFX_Number != 0).Select(x => x.JOFRT_SVO_PFX_Number));
            string SuffixIds = string.Join(", ", Suffix_DTO.Where(x => x.JOFRT_SVO_SFX_Number != 0).Select(x => x.JOFRT_SVO_SFX_Number));

            SON_DTO.CreatorCode = 1;

            SON_DTO.DeleteNumbers = ResetIds;
            SON_DTO.Id = 31;
            SON_DAO.JOFRT_SVO_NumberingDB(SON_DTO);

            SON_DTO.DeleteNumbers = PrefixIds;
            SON_DTO.Id = 32;
            SON_DAO.JOFRT_SVO_NumberingDB(SON_DTO);

            SON_DTO.DeleteNumbers = SuffixIds;
            SON_DTO.Id = 33;
            SON_DAO.JOFRT_SVO_NumberingDB(SON_DTO);

            SON_DTO.JOFRT_SVO_Method = PN_DTO.JOFRT_SVO_Method;
            if (PN_DTO.JOFRT_SVO_Number == 0)
            {
                SON_DTO.Id = 11;
            }
            else
            {
                SON_DTO.Id = 41;
                SON_DTO.JOFRT_SVO_Number = PN_DTO.JOFRT_SVO_Number;
            }
            SON_DAO.JOFRT_SVO_NumberingDB(SON_DTO);

            foreach (var Reset in Reset_DTO)
            {
                SON_DTO.JOFRT_SVO_Date = Convert.ToDateTime(Reset.JOFRT_SVO_NRS_StartDate).ToString("yyyyMMdd");
                SON_DTO.JOFRT_SVO_EndDate = Convert.ToDateTime(Reset.JOFRT_SVO_NRS_EndDate).ToString("yyyyMMdd");
                SON_DTO.JOFRT_SVO_StartingNumber = Convert.ToInt32(Reset.JOFRT_SVO_NRS_StartingNumber).ToString();
                SON_DTO.JOFRT_SVO_NumberofDigits = Convert.ToInt32(Reset.JOFRT_SVO_NRS_NumberofDigits).ToString();
                SON_DTO.JOFRT_SVO_PrefilZero = Convert.ToInt64(Reset.JOFRT_SVO_NRS_PrefilZero).ToString();
                SON_DTO.JOFRT_SVO_Frequency = Convert.ToInt64(Reset.JOFRT_SVO_NRS_Frequency).ToString();

                if (Reset.JOFRT_SVO_NRS_Number == 0)
                {
                    SON_DTO.Id = 12;
                }
                else
                {
                    SON_DTO.Id = 42;
                    SON_DTO.JOFRT_SVO_Number = Reset.JOFRT_SVO_NRS_Number;
                }
                SON_DAO.JOFRT_SVO_NumberingDB(SON_DTO);
            }

            foreach (var Prefix in Prefix_DTO)
            {
                SON_DTO.JOFRT_SVO_Date = Convert.ToDateTime(Prefix.JOFRT_SVO_PFX_StartDate).ToString("yyyyMMdd");
                SON_DTO.JOFRT_SVO_EndDate = Convert.ToDateTime(Prefix.JOFRT_SVO_PFX_EndDate).ToString("yyyyMMdd");
                SON_DTO.JOFRT_SVO_Particulars = Convert.ToString(Prefix.JOFRT_SVO_PFX_Particulars);

                if (Prefix.JOFRT_SVO_PFX_Number == 0)
                {
                    SON_DTO.Id = 13;
                }
                else
                {
                    SON_DTO.Id = 43;
                    SON_DTO.JOFRT_SVO_Number = Prefix.JOFRT_SVO_PFX_Number;
                }
                SON_DAO.JOFRT_SVO_NumberingDB(SON_DTO);
            }

            foreach (var Suffix in Suffix_DTO)
            {
                SON_DTO.JOFRT_SVO_Date = Convert.ToDateTime(Suffix.JOFRT_SVO_SFX_StartDate).ToString("yyyyMMdd");
                SON_DTO.JOFRT_SVO_EndDate = Convert.ToDateTime(Suffix.JOFRT_SVO_SFX_EndDate).ToString("yyyyMMdd");
                SON_DTO.JOFRT_SVO_Particulars = Convert.ToString(Suffix.JOFRT_SVO_SFX_Particulars);

                if (Suffix.JOFRT_SVO_SFX_Number == 0)
                {
                    SON_DTO.Id = 14;
                }
                else
                {
                    SON_DTO.Id = 44;
                    SON_DTO.JOFRT_SVO_Number = Suffix.JOFRT_SVO_SFX_Number;
                }
                SON_DAO.JOFRT_SVO_NumberingDB(SON_DTO);
            }

            SON_DTO.Reset();
            ModelState.Clear();

            GetJOFRT_SVO_Number();
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
            var dto = new JOFRT_SVO_Numbering_DTO
            {
                JOFRT_SVO_Date = DateTime.ParseExact(StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture).ToString("yyyyMMdd"),
                JOFRT_SVO_EndDate = DateTime.ParseExact(EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture).ToString("yyyyMMdd"),
                Id = id
            };

            DataSet ds = SON_DAO.JOFRT_SVO_NumberingDB(dto);
            bool exists = Convert.ToInt32(ds.Tables[0].Rows[0]["ExistsFlag"]) == 1;

            return new { success = !exists, message = exists ? msg : "" };
        }
    }
}