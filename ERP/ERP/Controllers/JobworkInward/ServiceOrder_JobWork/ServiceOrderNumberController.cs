using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobworkInward
{
    public class ServiceOrderNumberController : Controller
    {
        DataSet DS = new DataSet();
        Help Help = new Help();
        //DN NUMBERING
        JSONumber_DTO SON_DTO = new JSONumber_DTO();
        JSONumber_DAO SON_DAO = new JSONumber_DAO();
        JSONumbering_DL SON_DL = new JSONumbering_DL();

        List<JSONumberReset_DTO> JSOR_List = new List<JSONumberReset_DTO>();
        List<JSONumberPrefix_DTO> JSOP_List = new List<JSONumberPrefix_DTO>();
        List<JSONumberSuffix_DTO> JSOS_List = new List<JSONumberSuffix_DTO>();
        public IActionResult Index()
        {
            return View();
        }
        // JW Invoice Numbering
        [Route("serviceorder/setup/serviceorder-numbering")]
        public IActionResult JSONumbering()
        {
            GetJSONumber();
            return View(SON_DTO);
        }
        void GetJSONumber()
        {
            SON_DTO.CreatorCode = Convert.ToInt32(1);
            SON_DTO.Id = 1;
            DS = SON_DAO.JSONumberDB(SON_DTO);

            ViewBag.Method = Help.GetCat(DS.Tables[0]);
            ViewBag.Frequency = Help.GetCat(DS.Tables[1]);
            ViewBag.Prefil = Help.GetCat(DS.Tables[2]);

            if (DS.Tables[3].Rows.Count > 0)
            {
                SON_DTO.JSON_Number = Convert.ToInt64(DS.Tables[3].Rows[0]["JSON_Number"]);
                SON_DTO.JSON_Method = DS.Tables[3].Rows[0]["JSON_Method"].ToString();
            }

            SON_DTO.JSONumberReset = SON_DL.JSORList(DS.Tables[4]);
            SON_DTO.JSONumberPrefix = SON_DL.JSOPList(DS.Tables[5]);
            SON_DTO.JSONumberSuffix = SON_DL.JSOSList(DS.Tables[6]);
        }

        [Route("serviceorder/setup/serviceorder-numbering")]
        [HttpPost]
        public IActionResult JINumbering(JSONumber_DTO PN_DTO)
        {
            bool IsValid = false;
            JSONumber_DTO P_Head_DTO = new JSONumber_DTO();

            List<JSONumberReset_DTO>? Reset_DTO = new List<JSONumberReset_DTO>();
            List<JSONumberPrefix_DTO>? Prefix_DTO = new List<JSONumberPrefix_DTO>();
            List<JSONumberSuffix_DTO>? Suffix_DTO = new List<JSONumberSuffix_DTO>();

            P_Head_DTO = SON_DTO;

            if (PN_DTO.JSONumberReset != null)
                Reset_DTO = PN_DTO.JSONumberReset!.Where(K => !K.JSOR_IsDeleted).ToList();

            if (PN_DTO.JSONumberPrefix != null)
                Prefix_DTO = PN_DTO.JSONumberPrefix!.Where(K => !K.JSOP_IsDeleted).ToList();

            if (PN_DTO.JSONumberSuffix != null)
                Suffix_DTO = PN_DTO.JSONumberSuffix!.Where(K => !K.JSOS_IsDeleted).ToList();

            if (PN_DTO.JSON_Method == "2")
            {
                String ResetDTO = string.Join(", ", Reset_DTO.Where(x => Convert.ToInt64(x.JSOR_Number) != 0).Select(x => x.JSOR_Number));
                String PrefixDTO = string.Join(", ", Prefix_DTO.Where(x => Convert.ToInt64(x.JSOP_Number) != 0).Select(x => x.JSOP_Number));
                String SuffixDTO = string.Join(", ", Suffix_DTO.Where(x => Convert.ToInt64(x.JSOS_Number) != 0).Select(x => x.JSOS_Number));

                SON_DTO.CreatorCode = Convert.ToInt32(1);
                SON_DTO.DeleteNumbers = Convert.ToString(ResetDTO);
                SON_DTO.Id = 31;
                SON_DAO.JSONumberDB(SON_DTO);

                SON_DTO.DeleteNumbers = Convert.ToString(PrefixDTO);
                SON_DTO.Id = 32;
                SON_DAO.JSONumberDB(SON_DTO);

                SON_DTO.DeleteNumbers = Convert.ToString(SuffixDTO);
                SON_DTO.Id = 33;
                SON_DAO.JSONumberDB(SON_DTO);

                SON_DTO.JSON_Method = PN_DTO.JSON_Method;
                if (PN_DTO.JSON_Number == 0)
                {
                    SON_DTO.Id = 11;
                }
                else
                {
                    SON_DTO.Id = 41;
                    SON_DTO.JSON_Number = PN_DTO.JSON_Number;
                }
                SON_DAO.JSONumberDB(SON_DTO);

                foreach (var Reset in Reset_DTO)
                {
                    SON_DTO.JSON_Date = Convert.ToString(Convert.ToDateTime(Reset.JSOR_Date).ToString("yyyyMMdd"));
                    SON_DTO.JSON_EndDate = Convert.ToString(Convert.ToDateTime(Reset.JSOR_EndDate).ToString("yyyyMMdd"));
                    SON_DTO.JSON_StartingNumber = Convert.ToInt32(Reset.JSOR_StartingNumber).ToString();
                    SON_DTO.JSON_NumberofDigits = Convert.ToInt32(Reset.JSOR_NumberofDigits).ToString();
                    SON_DTO.JSON_PrefilZero = Convert.ToInt64(Reset.JSOR_PrefilZero).ToString();
                    SON_DTO.JSON_Frequency = Convert.ToInt64(Reset.JSOR_Frequency).ToString();

                    if (Reset.JSOR_Number == 0)
                    {
                        SON_DTO.Id = 12;
                    }
                    else
                    {
                        SON_DTO.Id = 42;
                        SON_DTO.JSON_Number = Reset.JSOR_Number;
                    }

                    SON_DAO.JSONumberDB(SON_DTO);
                }

                foreach (var Prefix in Prefix_DTO)
                {
                    SON_DTO.JSON_Date = Convert.ToString(Convert.ToDateTime(Prefix.JSOP_Date).ToString("yyyyMMdd"));
                    SON_DTO.JSON_EndDate = Convert.ToString(Convert.ToDateTime(Prefix.JSOP_EndDate).ToString("yyyyMMdd"));
                    SON_DTO.JSON_Particulars = Convert.ToString(Prefix.JSOP_Particulars);

                    if (Prefix.JSOP_Number == 0)
                    {
                        SON_DTO.Id = 13;
                    }
                    else
                    {
                        SON_DTO.Id = 43;
                        SON_DTO.JSON_Number = Prefix.JSOP_Number;
                    }

                    SON_DAO.JSONumberDB(SON_DTO);
                }

                foreach (var Suffix in Suffix_DTO)
                {
                    SON_DTO.JSON_Date = Convert.ToString(Convert.ToDateTime(Suffix.JSOS_Date).ToString("yyyyMMdd"));
                    SON_DTO.JSON_EndDate = Convert.ToString(Convert.ToDateTime(Suffix.JSOS_EndDate).ToString("yyyyMMdd"));
                    SON_DTO.JSON_Particulars = Convert.ToString(Suffix.JSOS_Particulars);

                    if (Suffix.JSOS_Number == 0)
                    {
                        SON_DTO.Id = 14;
                    }
                    else
                    {
                        SON_DTO.Id = 44;
                        SON_DTO.JSON_Number = Suffix.JSOS_Number;
                    }

                    SON_DAO.JSONumberDB(SON_DTO);
                }

                SON_DTO.Reset();
                Reset_DTO = null;
                Prefix_DTO = null;
                Suffix_DTO = null;
                ModelState.Clear();
            }
            else if (PN_DTO.JSON_Method == "3")
            {
                SON_DTO.JSON_Method = PN_DTO.JSON_Method;

                if (PN_DTO.JSON_Number == 0)
                {
                    SON_DTO.Id = 21;
                }
                else
                {
                    SON_DTO.Id = 22;
                    SON_DTO.JSON_Number = PN_DTO.JSON_Number;
                }

                SON_DAO.JSONumberDB(SON_DTO);
            }
            GetJSONumber();
            return View("JSONumbering", SON_DTO);
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

            JSONumber_DTO dto = new JSONumber_DTO();

            dto.JSON_Date = startDate.ToString();
            dto.JSON_EndDate = endDate.ToString();
            dto.Id = 51;

            DataSet ds = SON_DAO.JSONumberDB(dto);

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

            JSONumber_DTO dto = new JSONumber_DTO();

            dto.JSON_Date = startDate.ToString();
            dto.JSON_EndDate = endDate.ToString();
            dto.Id = 52;

            DataSet ds = SON_DAO.JSONumberDB(dto);

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

            JSONumber_DTO dto = new JSONumber_DTO();

            dto.JSON_Date = startDate.ToString();
            dto.JSON_EndDate = endDate.ToString();
            dto.Id = 53;

            DataSet ds = SON_DAO.JSONumberDB(dto);

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
