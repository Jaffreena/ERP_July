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
        //DN NUMBERING
        JINumber_DTO JON_DTO = new JINumber_DTO();
        JINumber_DAO JON_DAO = new JINumber_DAO();
        JINumbering_DL JON_DL = new JINumbering_DL();

        List<JINumberReset_DTO> JOR_List = new List<JINumberReset_DTO>();
        List<JINumberPrefix_DTO> JOP_List = new List<JINumberPrefix_DTO>();
        List<JINumberSuffix_DTO> JOS_List = new List<JINumberSuffix_DTO>();
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
            DS = JON_DAO.JINumberDB(JON_DTO);

            ViewBag.Method = Help.GetCat(DS.Tables[0]);
            ViewBag.Frequency = Help.GetCat(DS.Tables[1]);
            ViewBag.Prefil = Help.GetCat(DS.Tables[2]);

            if (DS.Tables[3].Rows.Count > 0)
            {
                JON_DTO.JIN_Number = Convert.ToInt64(DS.Tables[3].Rows[0]["JIN_Number"]);
                JON_DTO.JIN_Method = DS.Tables[3].Rows[0]["JIN_Method"].ToString();
            }

            JON_DTO.JINumberReset = JON_DL.JORList(DS.Tables[4]);
            JON_DTO.JINumberPrefix = JON_DL.JOPList(DS.Tables[5]);
            JON_DTO.JINumberSuffix = JON_DL.JOSList(DS.Tables[6]);
        }

        [Route("jwinvoice/setup/jwinvoice-numbering")]
        [HttpPost]
        public IActionResult JINumbering(JINumber_DTO PN_DTO)
        {
            bool IsValid = false;
            JINumber_DTO P_Head_DTO = new JINumber_DTO();

            List<JINumberReset_DTO>? Reset_DTO = new List<JINumberReset_DTO>();
            List<JINumberPrefix_DTO>? Prefix_DTO = new List<JINumberPrefix_DTO>();
            List<JINumberSuffix_DTO>? Suffix_DTO = new List<JINumberSuffix_DTO>();

            P_Head_DTO = JON_DTO;

            if (PN_DTO.JINumberReset != null)
                Reset_DTO = PN_DTO.JINumberReset!.Where(K => !K.JIR_IsDeleted).ToList();

            if (PN_DTO.JINumberPrefix != null)
                Prefix_DTO = PN_DTO.JINumberPrefix!.Where(K => !K.JIP_IsDeleted).ToList();

            if (PN_DTO.JINumberSuffix != null)
                Suffix_DTO = PN_DTO.JINumberSuffix!.Where(K => !K.JIS_IsDeleted).ToList();

            if (PN_DTO.JIN_Method == "2")
            {
                String ResetDTO = string.Join(", ", Reset_DTO.Where(x => Convert.ToInt64(x.JIR_Number) != 0).Select(x => x.JIR_Number));
                String PrefixDTO = string.Join(", ", Prefix_DTO.Where(x => Convert.ToInt64(x.JIP_Number) != 0).Select(x => x.JIP_Number));
                String SuffixDTO = string.Join(", ", Suffix_DTO.Where(x => Convert.ToInt64(x.JIS_Number) != 0).Select(x => x.JIS_Number));

                JON_DTO.CreatorCode = Convert.ToInt32(1);
                JON_DTO.DeleteNumbers = Convert.ToString(ResetDTO);
                JON_DTO.Id = 31;
                JON_DAO.JINumberDB(JON_DTO);

                JON_DTO.DeleteNumbers = Convert.ToString(PrefixDTO);
                JON_DTO.Id = 32;
                JON_DAO.JINumberDB(JON_DTO);

                JON_DTO.DeleteNumbers = Convert.ToString(SuffixDTO);
                JON_DTO.Id = 33;
                JON_DAO.JINumberDB(JON_DTO);

                JON_DTO.JIN_Method = PN_DTO.JIN_Method;
                if (PN_DTO.JIN_Number == 0)
                {
                    JON_DTO.Id = 11;
                }
                else
                {
                    JON_DTO.Id = 41;
                    JON_DTO.JIN_Number = PN_DTO.JIN_Number;
                }
                JON_DAO.JINumberDB(JON_DTO);

                foreach (var Reset in Reset_DTO)
                {
                    JON_DTO.JIN_Date = Convert.ToString(Convert.ToDateTime(Reset.JIR_Date).ToString("yyyyMMdd"));
                    JON_DTO.JIN_EndDate = Convert.ToString(Convert.ToDateTime(Reset.JIR_EndDate).ToString("yyyyMMdd"));
                    JON_DTO.JIN_StartingNumber = Convert.ToInt32(Reset.JIR_StartingNumber).ToString();
                    JON_DTO.JIN_NumberofDigits = Convert.ToInt32(Reset.JIR_NumberofDigits).ToString();
                    JON_DTO.JIN_PrefilZero = Convert.ToInt64(Reset.JIR_PrefilZero).ToString();
                    JON_DTO.JIN_Frequency = Convert.ToInt64(Reset.JIR_Frequency).ToString();

                    if (Reset.JIR_Number == 0)
                    {
                        JON_DTO.Id = 12;
                    }
                    else
                    {
                        JON_DTO.Id = 42;
                        JON_DTO.JIN_Number = Reset.JIR_Number;
                    }

                    JON_DAO.JINumberDB(JON_DTO);
                }

                foreach (var Prefix in Prefix_DTO)
                {
                    JON_DTO.JIN_Date = Convert.ToString(Convert.ToDateTime(Prefix.JIP_Date).ToString("yyyyMMdd"));
                    JON_DTO.JIN_EndDate = Convert.ToString(Convert.ToDateTime(Prefix.JIP_EndDate).ToString("yyyyMMdd"));
                    JON_DTO.JIN_Particulars = Convert.ToString(Prefix.JIP_Particulars);

                    if (Prefix.JIP_Number == 0)
                    {
                        JON_DTO.Id = 13;
                    }
                    else
                    {
                        JON_DTO.Id = 43;
                        JON_DTO.JIN_Number = Prefix.JIP_Number;
                    }

                    JON_DAO.JINumberDB(JON_DTO);
                }

                foreach (var Suffix in Suffix_DTO)
                {
                    JON_DTO.JIN_Date = Convert.ToString(Convert.ToDateTime(Suffix.JIS_Date).ToString("yyyyMMdd"));
                    JON_DTO.JIN_EndDate = Convert.ToString(Convert.ToDateTime(Suffix.JIS_EndDate).ToString("yyyyMMdd"));
                    JON_DTO.JIN_Particulars = Convert.ToString(Suffix.JIS_Particulars);

                    if (Suffix.JIS_Number == 0)
                    {
                        JON_DTO.Id = 14;
                    }
                    else
                    {
                        JON_DTO.Id = 44;
                        JON_DTO.JIN_Number = Suffix.JIS_Number;
                    }

                    JON_DAO.JINumberDB(JON_DTO);
                }

                JON_DTO.Reset();
                Reset_DTO = null;
                Prefix_DTO = null;
                Suffix_DTO = null;
                ModelState.Clear();
            }
            else if (PN_DTO.JIN_Method == "3")
            {
                JON_DTO.JIN_Method = PN_DTO.JIN_Method;

                if (PN_DTO.JIN_Number == 0)
                {
                    JON_DTO.Id = 21;
                }
                else
                {
                    JON_DTO.Id = 22;
                    JON_DTO.JIN_Number = PN_DTO.JIN_Number;
                }

                JON_DAO.JINumberDB(JON_DTO);
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

            JINumber_DTO dto = new JINumber_DTO();

            dto.JIN_Date = startDate.ToString();
            dto.JIN_EndDate = endDate.ToString();
            dto.Id = 51;

            DataSet ds = JON_DAO.JINumberDB(dto);

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

            JINumber_DTO dto = new JINumber_DTO();

            dto.JIN_Date = startDate.ToString();
            dto.JIN_EndDate = endDate.ToString();
            dto.Id = 52;

            DataSet ds = JON_DAO.JINumberDB(dto);

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

            JINumber_DTO dto = new JINumber_DTO();

            dto.JIN_Date = startDate.ToString();
            dto.JIN_EndDate = endDate.ToString();
            dto.Id = 53;

            DataSet ds = JON_DAO.JINumberDB(dto);

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
