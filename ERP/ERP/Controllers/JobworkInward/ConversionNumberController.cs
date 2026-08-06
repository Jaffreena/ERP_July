using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobworkInward
{
    public class ConversionNumberController : Controller
    {
        DataSet DS = new DataSet();
        Help Help = new Help();
        //DN NUMBERING
        JI_CONVNumber_DTO CONV_DTO = new JI_CONVNumber_DTO();
        JI_CONVNumber_DAO CONV_DAO = new JI_CONVNumber_DAO();
        JI_CONVNumbering_DL CONV_DL = new JI_CONVNumbering_DL();

        List<JI_CONVNumberReset_DTO> JICR_List = new List<JI_CONVNumberReset_DTO>();
        List<JI_CONVNumberPrefix_DTO> JICP_List = new List<JI_CONVNumberPrefix_DTO>();
        List<JI_CONVNumberSuffix_DTO> JICS_List = new List<JI_CONVNumberSuffix_DTO>();
        public IActionResult Index()
        {
            return View();
        }
        // JW Invoice Numbering
        [Route("conversion/setup/conversion-numbering")]
        public IActionResult JI_CONVNumbering()
        {
            GetJI_CONVNumber();
            return View(CONV_DTO);
        }
        void GetJI_CONVNumber()
        {
            CONV_DTO.CreatorCode = Convert.ToInt32(1);
            CONV_DTO.Id = 1;
            DS = CONV_DAO.JI_CONVNumberDB(CONV_DTO);

            ViewBag.Method = Help.GetCat(DS.Tables[0]);
            ViewBag.Frequency = Help.GetCat(DS.Tables[1]);
            ViewBag.Prefil = Help.GetCat(DS.Tables[2]);

            if (DS.Tables[3].Rows.Count > 0)
            {
                CONV_DTO.JICN_Number = Convert.ToInt64(DS.Tables[3].Rows[0]["JICN_Number"]);
                CONV_DTO.JICN_Method = DS.Tables[3].Rows[0]["JICN_Method"].ToString();
            }

            CONV_DTO.JI_CONVNumberReset = CONV_DL.JICRList(DS.Tables[4]);
            CONV_DTO.JI_CONVNumberPrefix = CONV_DL.JICPList(DS.Tables[5]);
            CONV_DTO.JI_CONVNumberSuffix = CONV_DL.JICSList(DS.Tables[6]);
        }

        [Route("conversion/setup/conversion-numbering")]
        [HttpPost]
        public IActionResult JI_CONVNumbering(JI_CONVNumber_DTO PN_DTO)
        {
            bool IsValid = false;
            JI_CONVNumber_DTO P_Head_DTO = new JI_CONVNumber_DTO();

            List<JI_CONVNumberReset_DTO>? Reset_DTO = new List<JI_CONVNumberReset_DTO>();
            List<JI_CONVNumberPrefix_DTO>? Prefix_DTO = new List<JI_CONVNumberPrefix_DTO>();
            List<JI_CONVNumberSuffix_DTO>? Suffix_DTO = new List<JI_CONVNumberSuffix_DTO>();

            P_Head_DTO = CONV_DTO;

            if (PN_DTO.JI_CONVNumberReset != null)
                Reset_DTO = PN_DTO.JI_CONVNumberReset!.Where(K => !K.JICR_IsDeleted).ToList();

            if (PN_DTO.JI_CONVNumberPrefix != null)
                Prefix_DTO = PN_DTO.JI_CONVNumberPrefix!.Where(K => !K.JICP_IsDeleted).ToList();

            if (PN_DTO.JI_CONVNumberSuffix != null)
                Suffix_DTO = PN_DTO.JI_CONVNumberSuffix!.Where(K => !K.JICS_IsDeleted).ToList();

            if (PN_DTO.JICN_Method == "2")
            {
                String ResetDTO = string.Join(", ", Reset_DTO.Where(x => Convert.ToInt64(x.JICR_Number) != 0).Select(x => x.JICR_Number));
                String PrefixDTO = string.Join(", ", Prefix_DTO.Where(x => Convert.ToInt64(x.JICP_Number) != 0).Select(x => x.JICP_Number));
                String SuffixDTO = string.Join(", ", Suffix_DTO.Where(x => Convert.ToInt64(x.JICS_Number) != 0).Select(x => x.JICS_Number));

                CONV_DTO.CreatorCode = Convert.ToInt32(1);
                CONV_DTO.DeleteNumbers = Convert.ToString(ResetDTO);
                CONV_DTO.Id = 31;
                CONV_DAO.JI_CONVNumberDB(CONV_DTO);

                CONV_DTO.DeleteNumbers = Convert.ToString(PrefixDTO);
                CONV_DTO.Id = 32;
                CONV_DAO.JI_CONVNumberDB(CONV_DTO);

                CONV_DTO.DeleteNumbers = Convert.ToString(SuffixDTO);
                CONV_DTO.Id = 33;
                CONV_DAO.JI_CONVNumberDB(CONV_DTO);

                CONV_DTO.JICN_Method = PN_DTO.JICN_Method;
                if (PN_DTO.JICN_Number == 0)
                {
                    CONV_DTO.Id = 11;
                }
                else
                {
                    CONV_DTO.Id = 41;
                    CONV_DTO.JICN_Number = PN_DTO.JICN_Number;
                }
                CONV_DAO.JI_CONVNumberDB(CONV_DTO);

                foreach (var Reset in Reset_DTO)
                {
                    CONV_DTO.JICN_Date = Convert.ToString(Convert.ToDateTime(Reset.JICR_Date).ToString("yyyyMMdd"));
                    CONV_DTO.JICN_EndDate = Convert.ToString(Convert.ToDateTime(Reset.JICR_EndDate).ToString("yyyyMMdd"));
                    CONV_DTO.JICN_StartingNumber = Convert.ToInt32(Reset.JICR_StartingNumber).ToString();
                    CONV_DTO.JICN_NumberofDigits = Convert.ToInt32(Reset.JICR_NumberofDigits).ToString();
                    CONV_DTO.JICN_PrefilZero = Convert.ToInt64(Reset.JICR_PrefilZero).ToString();
                    CONV_DTO.JICN_Frequency = Convert.ToInt64(Reset.JICR_Frequency).ToString();

                    if (Reset.JICR_Number == 0)
                    {
                        CONV_DTO.Id = 12;
                    }
                    else
                    {
                        CONV_DTO.Id = 42;
                        CONV_DTO.JICN_Number = Reset.JICR_Number;
                    }

                    CONV_DAO.JI_CONVNumberDB(CONV_DTO);
                }

                foreach (var Prefix in Prefix_DTO)
                {
                    CONV_DTO.JICN_Date = Convert.ToString(Convert.ToDateTime(Prefix.JICP_Date).ToString("yyyyMMdd"));
                    CONV_DTO.JICN_EndDate = Convert.ToString(Convert.ToDateTime(Prefix.JICP_EndDate).ToString("yyyyMMdd"));
                    CONV_DTO.JICN_Particulars = Convert.ToString(Prefix.JICP_Particulars);

                    if (Prefix.JICP_Number == 0)
                    {
                        CONV_DTO.Id = 13;
                    }
                    else
                    {
                        CONV_DTO.Id = 43;
                        CONV_DTO.JICN_Number = Prefix.JICP_Number;
                    }

                    CONV_DAO.JI_CONVNumberDB(CONV_DTO);
                }

                foreach (var Suffix in Suffix_DTO)
                {
                    CONV_DTO.JICN_Date = Convert.ToString(Convert.ToDateTime(Suffix.JICS_Date).ToString("yyyyMMdd"));
                    CONV_DTO.JICN_EndDate = Convert.ToString(Convert.ToDateTime(Suffix.JICS_EndDate).ToString("yyyyMMdd"));
                    CONV_DTO.JICN_Particulars = Convert.ToString(Suffix.JICS_Particulars);

                    if (Suffix.JICS_Number == 0)
                    {
                        CONV_DTO.Id = 14;
                    }
                    else
                    {
                        CONV_DTO.Id = 44;
                        CONV_DTO.JICN_Number = Suffix.JICS_Number;
                    }

                    CONV_DAO.JI_CONVNumberDB(CONV_DTO);
                }

                CONV_DTO.Reset();
                Reset_DTO = null;
                Prefix_DTO = null;
                Suffix_DTO = null;
                ModelState.Clear();
            }
            else if (PN_DTO.JICN_Method == "3")
            {
                CONV_DTO.JICN_Method = PN_DTO.JICN_Method;

                if (PN_DTO.JICN_Number == 0)
                {
                    CONV_DTO.Id = 21;
                }
                else
                {
                    CONV_DTO.Id = 22;
                    CONV_DTO.JICN_Number = PN_DTO.JICN_Number;
                }

                CONV_DAO.JI_CONVNumberDB(CONV_DTO);
            }
            GetJI_CONVNumber();
            return View(CONV_DTO);
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

            JI_CONVNumber_DTO dto = new JI_CONVNumber_DTO();

            dto.JICN_Date = startDate.ToString();
            dto.JICN_EndDate = endDate.ToString();
            dto.Id = 51;

            DataSet ds = CONV_DAO.JI_CONVNumberDB(dto);

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

            JI_CONVNumber_DTO dto = new JI_CONVNumber_DTO();

            dto.JICN_Date = startDate.ToString();
            dto.JICN_EndDate = endDate.ToString();
            dto.Id = 52;

            DataSet ds = CONV_DAO.JI_CONVNumberDB(dto);

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

            JI_CONVNumber_DTO dto = new JI_CONVNumber_DTO();

            dto.JICN_Date = startDate.ToString();
            dto.JICN_EndDate = endDate.ToString();
            dto.Id = 53;

            DataSet ds = CONV_DAO.JI_CONVNumberDB(dto);

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
