using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobworkInward
{
    public class JIFRT_SVO_NumberController : Controller
    {
        DataSet DS = new DataSet();
        Help Help = new Help();

        JIFRT_SVO_Numbering_DTO SON_DTO = new JIFRT_SVO_Numbering_DTO();
        JIFRT_SVO_Numbering_DAO SON_DAO = new JIFRT_SVO_Numbering_DAO();
        JIFRT_SVO_Numbering_DL SON_DL = new JIFRT_SVO_Numbering_DL();

        List<JIFRT_SVO_NumberReset_DTO> JSOR_List = new List<JIFRT_SVO_NumberReset_DTO>();
        List<JIFRT_SVO_NumberPrefix_DTO> JSOP_List = new List<JIFRT_SVO_NumberPrefix_DTO>();
        List<JIFRT_SVO_NumberSuffix_DTO> JSOS_List = new List<JIFRT_SVO_NumberSuffix_DTO>();

        public IActionResult Index()
        {
            return View();
        }

        [Route("serviceorder/setup/jifrt-serviceorder-numbering")]
        public IActionResult JIFRT_SVO_Numbering()
        {
            GetJIFRT_SVO_Number();
            return View("~/Views/JobworkInward/ServiceOrder_Freight/JIFRT_SVO_Number/JIFRT_SVO_Numbering.cshtml", SON_DTO);
        }

        void GetJIFRT_SVO_Number()
        {
            SON_DTO.CreatorCode = Convert.ToInt32(1);
            SON_DTO.Id = 1;
            DS = SON_DAO.JIFRT_SVO_NumberingDB(SON_DTO);

            ViewBag.Method = Help.GetCat(DS.Tables[0]);
            ViewBag.Frequency = Help.GetCat(DS.Tables[1]);
            ViewBag.Prefil = Help.GetCat(DS.Tables[2]);

            if (DS.Tables[3].Rows.Count > 0)
            {
                SON_DTO.JIFRT_SVO_Number = Convert.ToInt64(DS.Tables[3].Rows[0]["JIFRT_SVO_Number"]);
                SON_DTO.JIFRT_SVO_Method = DS.Tables[3].Rows[0]["JIFRT_SVO_Method"].ToString();
            }

            SON_DTO.JIFRT_SVO_NumberReset = SON_DL.JIFRT_SVO_NRSList(DS.Tables[4]);
            SON_DTO.JIFRT_SVO_NumberPrefix = SON_DL.JIFRT_SVO_PFXList(DS.Tables[5]);
            SON_DTO.JIFRT_SVO_NumberSuffix = SON_DL.JIFRT_SVO_SFXList(DS.Tables[6]);
        }

        [Route("serviceorder/setup/jifrt-serviceorder-numbering")]
        [HttpPost]
        public IActionResult JIFRT_SVO_NumberingPost(JIFRT_SVO_Numbering_DTO PN_DTO)
        {
            JIFRT_SVO_Numbering_DTO P_Head_DTO = new JIFRT_SVO_Numbering_DTO();

            List<JIFRT_SVO_NumberReset_DTO>? Reset_DTO = new List<JIFRT_SVO_NumberReset_DTO>();
            List<JIFRT_SVO_NumberPrefix_DTO>? Prefix_DTO = new List<JIFRT_SVO_NumberPrefix_DTO>();
            List<JIFRT_SVO_NumberSuffix_DTO>? Suffix_DTO = new List<JIFRT_SVO_NumberSuffix_DTO>();

            P_Head_DTO = SON_DTO;

            if (PN_DTO.JIFRT_SVO_NumberReset != null)
                Reset_DTO = PN_DTO.JIFRT_SVO_NumberReset!.Where(K => !K.JIFRT_SVO_NRS_IsDeleted).ToList();

            if (PN_DTO.JIFRT_SVO_NumberPrefix != null)
                Prefix_DTO = PN_DTO.JIFRT_SVO_NumberPrefix!.Where(K => !K.JIFRT_SVO_PFX_IsDeleted).ToList();

            if (PN_DTO.JIFRT_SVO_NumberSuffix != null)
                Suffix_DTO = PN_DTO.JIFRT_SVO_NumberSuffix!.Where(K => !K.JIFRT_SVO_SFX_IsDeleted).ToList();
            PN_DTO.JIFRT_SVO_Method = "2";
            if (PN_DTO.JIFRT_SVO_Method == "2")
            {
                String ResetDTO = string.Join(", ", Reset_DTO.Where(x => Convert.ToInt64(x.JIFRT_SVO_NRS_Number) != 0).Select(x => x.JIFRT_SVO_NRS_Number));
                String PrefixDTO = string.Join(", ", Prefix_DTO.Where(x => Convert.ToInt64(x.JIFRT_SVO_PFX_Number) != 0).Select(x => x.JIFRT_SVO_PFX_Number));
                String SuffixDTO = string.Join(", ", Suffix_DTO.Where(x => Convert.ToInt64(x.JIFRT_SVO_SFX_Number) != 0).Select(x => x.JIFRT_SVO_SFX_Number));

                SON_DTO.CreatorCode = Convert.ToInt32(1);
                SON_DTO.DeleteNumbers = Convert.ToString(ResetDTO);
                SON_DTO.Id = 31;
                SON_DAO.JIFRT_SVO_NumberingDB(SON_DTO);

                SON_DTO.DeleteNumbers = Convert.ToString(PrefixDTO);
                SON_DTO.Id = 32;
                SON_DAO.JIFRT_SVO_NumberingDB(SON_DTO);

                SON_DTO.DeleteNumbers = Convert.ToString(SuffixDTO);
                SON_DTO.Id = 33;
                SON_DAO.JIFRT_SVO_NumberingDB(SON_DTO);

                SON_DTO.JIFRT_SVO_Method = PN_DTO.JIFRT_SVO_Method;
                if (PN_DTO.JIFRT_SVO_Number == 0)
                {
                    SON_DTO.Id = 11;
                }
                else
                {
                    SON_DTO.Id = 41;
                    SON_DTO.JIFRT_SVO_Number = PN_DTO.JIFRT_SVO_Number;
                }
                SON_DAO.JIFRT_SVO_NumberingDB(SON_DTO);

                foreach (var Reset in Reset_DTO)
                {
                    SON_DTO.JIFRT_SVO_Date = Convert.ToString(Convert.ToDateTime(Reset.JIFRT_SVO_NRS_StartDate).ToString("yyyyMMdd"));
                    SON_DTO.JIFRT_SVO_EndDate = Convert.ToString(Convert.ToDateTime(Reset.JIFRT_SVO_NRS_EndDate).ToString("yyyyMMdd"));
                    SON_DTO.JIFRT_SVO_StartingNumber = Convert.ToInt32(Reset.JIFRT_SVO_NRS_StartingNumber).ToString();
                    SON_DTO.JIFRT_SVO_NumberofDigits = Convert.ToInt32(Reset.JIFRT_SVO_NRS_NumberofDigits).ToString();
                    SON_DTO.JIFRT_SVO_PrefilZero = Convert.ToInt64(Reset.JIFRT_SVO_NRS_PrefilZero).ToString();
                    SON_DTO.JIFRT_SVO_Frequency = Convert.ToInt64(Reset.JIFRT_SVO_NRS_Frequency).ToString();

                    if (Reset.JIFRT_SVO_NRS_Number == 0)
                    {
                        SON_DTO.Id = 12;
                    }
                    else
                    {
                        SON_DTO.Id = 42;
                        SON_DTO.JIFRT_SVO_Number = Reset.JIFRT_SVO_NRS_Number;
                    }

                    SON_DAO.JIFRT_SVO_NumberingDB(SON_DTO);
                }

                foreach (var Prefix in Prefix_DTO)
                {
                    SON_DTO.JIFRT_SVO_Date = Convert.ToString(Convert.ToDateTime(Prefix.JIFRT_SVO_PFX_StartDate).ToString("yyyyMMdd"));
                    SON_DTO.JIFRT_SVO_EndDate = Convert.ToString(Convert.ToDateTime(Prefix.JIFRT_SVO_PFX_EndDate).ToString("yyyyMMdd"));
                    SON_DTO.JIFRT_SVO_Particulars = Convert.ToString(Prefix.JIFRT_SVO_PFX_Particulars);

                    if (Prefix.JIFRT_SVO_PFX_Number == 0)
                    {
                        SON_DTO.Id = 13;
                    }
                    else
                    {
                        SON_DTO.Id = 43;
                        SON_DTO.JIFRT_SVO_Number = Prefix.JIFRT_SVO_PFX_Number;
                    }

                    SON_DAO.JIFRT_SVO_NumberingDB(SON_DTO);
                }

                foreach (var Suffix in Suffix_DTO)
                {
                    SON_DTO.JIFRT_SVO_Date = Convert.ToString(Convert.ToDateTime(Suffix.JIFRT_SVO_SFX_StartDate).ToString("yyyyMMdd"));
                    SON_DTO.JIFRT_SVO_EndDate = Convert.ToString(Convert.ToDateTime(Suffix.JIFRT_SVO_SFX_EndDate).ToString("yyyyMMdd"));
                    SON_DTO.JIFRT_SVO_Particulars = Convert.ToString(Suffix.JIFRT_SVO_SFX_Particulars);

                    if (Suffix.JIFRT_SVO_SFX_Number == 0)
                    {
                        SON_DTO.Id = 14;
                    }
                    else
                    {
                        SON_DTO.Id = 44;
                        SON_DTO.JIFRT_SVO_Number = Suffix.JIFRT_SVO_SFX_Number;
                    }

                    SON_DAO.JIFRT_SVO_NumberingDB(SON_DTO);
                }

                SON_DTO.Reset();
                Reset_DTO = null;
                Prefix_DTO = null;
                Suffix_DTO = null;
                ModelState.Clear();
            }
            else if (PN_DTO.JIFRT_SVO_Method == "3")
            {
                SON_DTO.JIFRT_SVO_Method = PN_DTO.JIFRT_SVO_Method;

                if (PN_DTO.JIFRT_SVO_Number == 0)
                {
                    SON_DTO.Id = 21;
                }
                else
                {
                    SON_DTO.Id = 22;
                    SON_DTO.JIFRT_SVO_Number = PN_DTO.JIFRT_SVO_Number;
                }

                SON_DAO.JIFRT_SVO_NumberingDB(SON_DTO);
            }
            GetJIFRT_SVO_Number();
            return View("~/Views/JobworkInward/ServiceOrder_Freight/JIFRT_SVO_Numbering.cshtml", SON_DTO);
        }

        [HttpPost]
        public JsonResult ValidateDateRange(string StartDate, string EndDate)
        {
            int startDate = int.Parse(
                DateTime.ParseExact(StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        .ToString("yyyyMMdd"));

            int endDate = int.Parse(
                DateTime.ParseExact(EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        .ToString("yyyyMMdd"));

            JIFRT_SVO_Numbering_DTO dto = new JIFRT_SVO_Numbering_DTO();

            dto.JIFRT_SVO_Date = startDate.ToString();
            dto.JIFRT_SVO_EndDate = endDate.ToString();
            dto.Id = 51;

            DataSet ds = SON_DAO.JIFRT_SVO_NumberingDB(dto);

            bool exists = Convert.ToInt32(ds.Tables[0].Rows[0]["ExistsFlag"]) == 1;

            return Json(new
            {
                success = !exists,
                message = exists
                    ? "The selected date range overlaps with an existing date range."
                    : ""
            });
        }

        [HttpPost]
        public JsonResult ValidatePrefixDateRange(string StartDate, string EndDate)
        {
            int startDate = int.Parse(
                DateTime.ParseExact(StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        .ToString("yyyyMMdd"));

            int endDate = int.Parse(
                DateTime.ParseExact(EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        .ToString("yyyyMMdd"));

            JIFRT_SVO_Numbering_DTO dto = new JIFRT_SVO_Numbering_DTO();

            dto.JIFRT_SVO_Date = startDate.ToString();
            dto.JIFRT_SVO_EndDate = endDate.ToString();
            dto.Id = 52;

            DataSet ds = SON_DAO.JIFRT_SVO_NumberingDB(dto);

            bool exists = Convert.ToInt32(ds.Tables[0].Rows[0]["ExistsFlag"]) == 1;

            return Json(new
            {
                success = !exists,
                message = exists
                    ? "The selected Prefix date range overlaps with an existing date range."
                    : ""
            });
        }

        [HttpPost]
        public JsonResult ValidateSuffixDateRange(string StartDate, string EndDate)
        {
            int startDate = int.Parse(
                DateTime.ParseExact(StartDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        .ToString("yyyyMMdd"));

            int endDate = int.Parse(
                DateTime.ParseExact(EndDate, "dd-MMM-yyyy", CultureInfo.InvariantCulture)
                        .ToString("yyyyMMdd"));

            JIFRT_SVO_Numbering_DTO dto = new JIFRT_SVO_Numbering_DTO();

            dto.JIFRT_SVO_Date = startDate.ToString();
            dto.JIFRT_SVO_EndDate = endDate.ToString();
            dto.Id = 53;

            DataSet ds = SON_DAO.JIFRT_SVO_NumberingDB(dto);

            bool exists = Convert.ToInt32(ds.Tables[0].Rows[0]["ExistsFlag"]) == 1;

            return Json(new
            {
                success = !exists,
                message = exists
                    ? "The selected Suffix date range overlaps with an existing date range."
                    : ""
            });
        }
    }
}