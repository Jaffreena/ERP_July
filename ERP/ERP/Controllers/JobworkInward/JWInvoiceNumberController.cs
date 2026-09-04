using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobworkInward
{
    public class JWInvoiceNumberController : Controller
    {
        DataSet DS = new DataSet();
        Help Help = new Help();
        //JWI NUMBERING
        JIJWI_Numbering_DTO JON_DTO = new JIJWI_Numbering_DTO();
        JIJWI_Numbering_DAO JON_DAO = new JIJWI_Numbering_DAO();
        JIJWI_Numbering_DL JON_DL = new JIJWI_Numbering_DL();

        List<JIJWI_NumberReset_DTO> JOR_List = new List<JIJWI_NumberReset_DTO>();
        List<JIJWI_NumberPrefix_DTO> JOP_List = new List<JIJWI_NumberPrefix_DTO>();
        List<JIJWI_NumberSuffix_DTO> JOS_List = new List<JIJWI_NumberSuffix_DTO>();
        public IActionResult Index()
        {
            return View();
        }
        // JW Invoice Numbering
        [Route("jwinvoice/setup/jwinvoice-numbering")]
        public IActionResult JINumbering()
        {
            GetJINumber();
            return View(JON_DTO);
        }
        void GetJINumber()
        {
            JON_DTO.CreatorCode = Convert.ToInt32(1);
            JON_DTO.Id = 1;
            DS = JON_DAO.JIJWI_NumberingDB(JON_DTO);

            ViewBag.Method = Help.GetCat(DS.Tables[0]);
            ViewBag.Frequency = Help.GetCat(DS.Tables[1]);
            ViewBag.Prefil = Help.GetCat(DS.Tables[2]);

            if (DS.Tables[3].Rows.Count > 0)
            {
                JON_DTO.JIJWI_Number = Convert.ToInt64(DS.Tables[3].Rows[0]["JIJWI_Number"]);
                JON_DTO.JIJWI_Method = DS.Tables[3].Rows[0]["JIJWI_Method"].ToString();
            }

            JON_DTO.JIJWI_NumberReset = JON_DL.JORList(DS.Tables[4]);
            JON_DTO.JIJWI_NumberPrefix = JON_DL.JOPList(DS.Tables[5]);
            JON_DTO.JIJWI_NumberSuffix = JON_DL.JOSList(DS.Tables[6]);
        }

        [Route("jwinvoice/setup/jwinvoice-numbering")]
        [HttpPost]
        public IActionResult JINumbering(JIJWI_Numbering_DTO PN_DTO)
        {
            bool IsValid = false;
            JIJWI_Numbering_DTO P_Head_DTO = new JIJWI_Numbering_DTO();

            List<JIJWI_NumberReset_DTO>? Reset_DTO = new List<JIJWI_NumberReset_DTO>();
            List<JIJWI_NumberPrefix_DTO>? Prefix_DTO = new List<JIJWI_NumberPrefix_DTO>();
            List<JIJWI_NumberSuffix_DTO>? Suffix_DTO = new List<JIJWI_NumberSuffix_DTO>();

            P_Head_DTO = JON_DTO;

            if (PN_DTO.JIJWI_NumberReset != null)
                Reset_DTO = PN_DTO.JIJWI_NumberReset!.Where(K => !K.JIJWI__NRS_IsDeleted).ToList();

            if (PN_DTO.JIJWI_NumberPrefix != null)
                Prefix_DTO = PN_DTO.JIJWI_NumberPrefix!.Where(K => !K.JIJWI_PFX_IsDeleted).ToList();

            if (PN_DTO.JIJWI_NumberSuffix != null)
                Suffix_DTO = PN_DTO.JIJWI_NumberSuffix!.Where(K => !K.JIJWI_SFX_IsDeleted).ToList();
            PN_DTO.JIJWI_Method = "2";
            if (PN_DTO.JIJWI_Method == "2")
            {
                String ResetDTO = string.Join(", ", Reset_DTO.Where(x => Convert.ToInt64(x.JIJWI__NRS_Number) != 0).Select(x => x.JIJWI__NRS_Number));
                String PrefixDTO = string.Join(", ", Prefix_DTO.Where(x => Convert.ToInt64(x.JIJWI_PFX_Number) != 0).Select(x => x.JIJWI_PFX_Number));
                String SuffixDTO = string.Join(", ", Suffix_DTO.Where(x => Convert.ToInt64(x.JIJWI_SFX_Number) != 0).Select(x => x.JIJWI_SFX_Number));

                JON_DTO.CreatorCode = Convert.ToInt32(1);
                JON_DTO.DeleteNumbers = Convert.ToString(ResetDTO);
                JON_DTO.Id = 31;
                JON_DAO.JIJWI_NumberingDB(JON_DTO);

                JON_DTO.DeleteNumbers = Convert.ToString(PrefixDTO);
                JON_DTO.Id = 32;
                JON_DAO.JIJWI_NumberingDB(JON_DTO);

                JON_DTO.DeleteNumbers = Convert.ToString(SuffixDTO);
                JON_DTO.Id = 33;
                JON_DAO.JIJWI_NumberingDB(JON_DTO);

                JON_DTO.JIJWI_Method = PN_DTO.JIJWI_Method;
                if (PN_DTO.JIJWI_Number == 0)
                {
                    JON_DTO.Id = 11;
                }
                else
                {
                    JON_DTO.Id = 41;
                    JON_DTO.JIJWI_Number = PN_DTO.JIJWI_Number;
                }
                JON_DAO.JIJWI_NumberingDB(JON_DTO);

                foreach (var Reset in Reset_DTO)
                {
                    JON_DTO.JIJWI_Date = Convert.ToString(Convert.ToDateTime(Reset.JIJWI__NRS_StartDate).ToString("yyyyMMdd"));
                    JON_DTO.JIJWI_EndDate = Convert.ToString(Convert.ToDateTime(Reset.JIJWI__NRS_EndDate).ToString("yyyyMMdd"));
                    JON_DTO.JIJWI_StartingNumber = Convert.ToInt32(Reset.JIJWI__NRS_StartingNumber).ToString();
                    JON_DTO.JIJWI_NumberofDigits = Convert.ToInt32(Reset.JIJWI__NRS_NumberofDigits).ToString();
                    JON_DTO.JIJWI_PrefilZero = Convert.ToInt64(Reset.JIJWI__NRS_PrefilZero).ToString();
                    JON_DTO.JIJWI_Frequency = Convert.ToInt64(Reset.JIJWI__NRS_Frequency).ToString();

                    if (Reset.JIJWI__NRS_Number == 0)
                    {
                        JON_DTO.Id = 12;
                    }
                    else
                    {
                        JON_DTO.Id = 42;
                        JON_DTO.JIJWI_Number = Reset.JIJWI__NRS_Number;
                    }

                    JON_DAO.JIJWI_NumberingDB(JON_DTO);
                }

                foreach (var Prefix in Prefix_DTO)
                {
                    JON_DTO.JIJWI_Date = Convert.ToString(Convert.ToDateTime(Prefix.JIJWI_PFX_StartDate).ToString("yyyyMMdd"));
                    JON_DTO.JIJWI_EndDate = Convert.ToString(Convert.ToDateTime(Prefix.JIJWI_PFX_EndDate).ToString("yyyyMMdd"));
                    JON_DTO.JIJWI_Particulars = Convert.ToString(Prefix.JIJWI_PFX_Particulars);

                    if (Prefix.JIJWI_PFX_Number == 0)
                    {
                        JON_DTO.Id = 13;
                    }
                    else
                    {
                        JON_DTO.Id = 43;
                        JON_DTO.JIJWI_Number = Prefix.JIJWI_PFX_Number;
                    }

                    JON_DAO.JIJWI_NumberingDB(JON_DTO);
                }

                foreach (var Suffix in Suffix_DTO)
                {
                    JON_DTO.JIJWI_Date = Convert.ToString(Convert.ToDateTime(Suffix.JIJWI_SFX_StartDate).ToString("yyyyMMdd"));
                    JON_DTO.JIJWI_EndDate = Convert.ToString(Convert.ToDateTime(Suffix.JIJWI_SFX_EndDate).ToString("yyyyMMdd"));
                    JON_DTO.JIJWI_Particulars = Convert.ToString(Suffix.JIJWI_SFX_Particulars);

                    if (Suffix.JIJWI_SFX_Number == 0)
                    {
                        JON_DTO.Id = 14;
                    }
                    else
                    {
                        JON_DTO.Id = 44;
                        JON_DTO.JIJWI_Number = Suffix.JIJWI_SFX_Number;
                    }

                    JON_DAO.JIJWI_NumberingDB(JON_DTO);
                }

                JON_DTO.Reset();
                Reset_DTO = null;
                Prefix_DTO = null;
                Suffix_DTO = null;
                ModelState.Clear();
            }
            else if (PN_DTO.JIJWI_Method == "3")
            {
                JON_DTO.JIJWI_Method = PN_DTO.JIJWI_Method;

                if (PN_DTO.JIJWI_Number == 0)
                {
                    JON_DTO.Id = 21;
                }
                else
                {
                    JON_DTO.Id = 22;
                    JON_DTO.JIJWI_Number = PN_DTO.JIJWI_Number;
                }

                JON_DAO.JIJWI_NumberingDB(JON_DTO);
            }
            GetJINumber();
            return View(JON_DTO);
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

            JIJWI_Numbering_DTO dto = new JIJWI_Numbering_DTO();

            dto.JIJWI_Date = startDate.ToString();
            dto.JIJWI_EndDate = endDate.ToString();
            dto.Id = 51;

            DataSet ds = JON_DAO.JIJWI_NumberingDB(dto);

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

            JIJWI_Numbering_DTO dto = new JIJWI_Numbering_DTO();

            dto.JIJWI_Date = startDate.ToString();
            dto.JIJWI_EndDate = endDate.ToString();
            dto.Id = 52;

            DataSet ds = JON_DAO.JIJWI_NumberingDB(dto);

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

            JIJWI_Numbering_DTO dto = new JIJWI_Numbering_DTO();

            dto.JIJWI_Date = startDate.ToString();
            dto.JIJWI_EndDate = endDate.ToString();
            dto.Id = 53;

            DataSet ds = JON_DAO.JIJWI_NumberingDB(dto);

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