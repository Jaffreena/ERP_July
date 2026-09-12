using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobworkInward
{
    public class JIDN_NumberController : Controller
    {
        DataSet DS = new DataSet();
        Help Help = new Help();
        //DN NUMBERING
        DNNumber_DTO DON_DTO = new DNNumber_DTO();
        JIDN_Numbering_DAO DON_DAO = new JIDN_Numbering_DAO();
        JIDN_Numbering_DL DON_DL = new JIDN_Numbering_DL();

        List<JIDN_NumberReset_DTO> DOR_List = new List<JIDN_NumberReset_DTO>();
        List<JIDN_NumberPrefix_DTO> DOP_List = new List<JIDN_NumberPrefix_DTO>();
        List<JIDN_NumberSuffix_DTO> DOS_List = new List<JIDN_NumberSuffix_DTO>();
        public IActionResult Index()
        {
            return View();
        }
        // Delivery Note Numbering
        [Route("deliverynote/setup/deliverynote-numbering")]
        public IActionResult DNNumbering()
        {
            GetDNNumber();
            return View("~/Views/JobworkInward/DeliveryNote/DeliveryNoteNumber/DNNumbering.cshtml", DON_DTO);
        }
        void GetDNNumber()
        {
            DON_DTO.CreatorCode = Convert.ToInt32(1);
            DON_DTO.Id = 1;
            DS = DON_DAO.JIDN_NumberingDB(DON_DTO);

            ViewBag.Method = Help.GetCat(DS.Tables[0]);
            ViewBag.Frequency = Help.GetCat(DS.Tables[1]);
            ViewBag.Prefil = Help.GetCat(DS.Tables[2]);

            if (DS.Tables[3].Rows.Count > 0)
            {
                DON_DTO.DNN_Number = Convert.ToInt64(DS.Tables[3].Rows[0]["DNN_Number"]);
                DON_DTO.DNN_Method = DS.Tables[3].Rows[0]["DNN_Method"].ToString();
            }

            DON_DTO.DNNumberReset = DON_DL.JIDN_NRList(DS.Tables[4]);
            DON_DTO.DNNumberPrefix = DON_DL.JIDN_PrefixList(DS.Tables[5]);
            DON_DTO.DNNumberSuffix = DON_DL.JIDN_SuffixList(DS.Tables[6]);
        }

        [Route("deliverynote/setup/deliverynote-numbering")]
        [HttpPost]
        public IActionResult DNNumbering(DNNumber_DTO PN_DTO)
        {
            bool IsValid = false;
            DNNumber_DTO P_Head_DTO = new DNNumber_DTO();

            List<JIDN_NumberReset_DTO>? Reset_DTO = new List<JIDN_NumberReset_DTO>();
            List<JIDN_NumberPrefix_DTO>? Prefix_DTO = new List<JIDN_NumberPrefix_DTO>();
            List<JIDN_NumberSuffix_DTO>? Suffix_DTO = new List<JIDN_NumberSuffix_DTO>();

            P_Head_DTO = DON_DTO;

            if (PN_DTO.DNNumberReset != null)
                Reset_DTO = PN_DTO.DNNumberReset!.Where(K => !K.DNR_IsDeleted).ToList();

            if (PN_DTO.DNNumberPrefix != null)
                Prefix_DTO = PN_DTO.DNNumberPrefix!.Where(K => !K.DNP_IsDeleted).ToList();

            if (PN_DTO.DNNumberSuffix != null)
                Suffix_DTO = PN_DTO.DNNumberSuffix!.Where(K => !K.DNS_IsDeleted).ToList();

            if (PN_DTO.DNN_Method == "2")
            {
                String ResetDTO = string.Join(", ", Reset_DTO.Where(x => Convert.ToInt64(x.JIDN_NR_Number) != 0).Select(x => x.JIDN_NR_Number));
                String PrefixDTO = string.Join(", ", Prefix_DTO.Where(x => Convert.ToInt64(x.JIDN_Prefix_Number) != 0).Select(x => x.JIDN_Prefix_Number));
                String SuffixDTO = string.Join(", ", Suffix_DTO.Where(x => Convert.ToInt64(x.JIDN_Suffix_Number) != 0).Select(x => x.JIDN_Suffix_Number));

                DON_DTO.CreatorCode = Convert.ToInt32(1);
                DON_DTO.DeleteNumbers = Convert.ToString(ResetDTO);
                DON_DTO.Id = 31;
                DON_DAO.JIDN_NumberingDB(DON_DTO);

                DON_DTO.DeleteNumbers = Convert.ToString(PrefixDTO);
                DON_DTO.Id = 32;
                DON_DAO.JIDN_NumberingDB(DON_DTO);

                DON_DTO.DeleteNumbers = Convert.ToString(SuffixDTO);
                DON_DTO.Id = 33;
                DON_DAO.JIDN_NumberingDB(DON_DTO);

                DON_DTO.DNN_Method = PN_DTO.DNN_Method;
                if (PN_DTO.DNN_Number == 0)
                {
                    DON_DTO.Id = 11;
                }
                else
                {
                    DON_DTO.Id = 41;
                    DON_DTO.DNN_Number = PN_DTO.DNN_Number;
                }
                DON_DAO.JIDN_NumberingDB(DON_DTO);

                foreach (var Reset in Reset_DTO)
                {
                    DON_DTO.DNN_Date = Convert.ToString(Convert.ToDateTime(Reset.JIDN_NR_Date).ToString("yyyyMMdd"));
                    DON_DTO.DNN_EndDate = Convert.ToString(Convert.ToDateTime(Reset.JIDN_NR_EndDate).ToString("yyyyMMdd"));
                    DON_DTO.DNN_StartingNumber = Convert.ToInt32(Reset.JIDN_NR_StartingNumber).ToString();
                    DON_DTO.DNN_NumberofDigits = Convert.ToInt32(Reset.JIDN_NR_NumberofDigits).ToString();
                    DON_DTO.DNN_PrefilZero = Convert.ToInt64(Reset.JIDN_NR_PrefilZero).ToString();
                    DON_DTO.DNN_Frequency = Convert.ToInt64(Reset.JIDN_NR_Frequency).ToString();

                    if (Reset.JIDN_NR_Number == 0)
                    {
                        DON_DTO.Id = 12;
                    }
                    else
                    {
                        DON_DTO.Id = 42;
                        DON_DTO.DNN_Number = Reset.JIDN_NR_Number;
                    }

                    DON_DAO.JIDN_NumberingDB(DON_DTO);
                }

                foreach (var Prefix in Prefix_DTO)
                {
                    DON_DTO.DNN_Date = Convert.ToString(Convert.ToDateTime(Prefix.JIDN_Prefix_Date).ToString("yyyyMMdd"));
                    DON_DTO.DNN_EndDate = Convert.ToString(Convert.ToDateTime(Prefix.JIDN_Prefix_EndDate).ToString("yyyyMMdd"));
                    DON_DTO.DNN_Particulars = Convert.ToString(Prefix.JIDN_Prefix_Particulars);

                    if (Prefix.JIDN_Prefix_Number == 0)
                    {
                        DON_DTO.Id = 13;
                    }
                    else
                    {
                        DON_DTO.Id = 43;
                        DON_DTO.DNN_Number = Prefix.JIDN_Prefix_Number;
                    }

                    DON_DAO.JIDN_NumberingDB(DON_DTO);
                }

                foreach (var Suffix in Suffix_DTO)
                {
                    DON_DTO.DNN_Date = Convert.ToString(Convert.ToDateTime(Suffix.JIDN_Suffix_Date).ToString("yyyyMMdd"));
                    DON_DTO.DNN_EndDate = Convert.ToString(Convert.ToDateTime(Suffix.JIDN_Suffix_EndDate).ToString("yyyyMMdd"));
                    DON_DTO.DNN_Particulars = Convert.ToString(Suffix.JIDN_Suffix_Particulars);

                    if (Suffix.JIDN_Suffix_Number == 0)
                    {
                        DON_DTO.Id = 14;
                    }
                    else
                    {
                        DON_DTO.Id = 44;
                        DON_DTO.DNN_Number = Suffix.JIDN_Suffix_Number;
                    }

                    DON_DAO.JIDN_NumberingDB(DON_DTO);
                }

                DON_DTO.Reset();
                Reset_DTO = null;
                Prefix_DTO = null;
                Suffix_DTO = null;
                ModelState.Clear();
            }
            else if (PN_DTO.DNN_Method == "3")
            {
                DON_DTO.DNN_Method = PN_DTO.DNN_Method;

                if (PN_DTO.DNN_Number == 0)
                {
                    DON_DTO.Id = 21;
                }
                else
                {
                    DON_DTO.Id = 22;
                    DON_DTO.DNN_Number = PN_DTO.DNN_Number;
                }

                DON_DAO.JIDN_NumberingDB(DON_DTO);
            }
            GetDNNumber();
            return View("~/Views/JobworkInward/DeliveryNote/DeliveryNoteNumber/DNNumbering.cshtml", DON_DTO);
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

            DNNumber_DTO dto = new DNNumber_DTO();

            dto.DNN_Date = startDate.ToString();
            dto.DNN_EndDate = endDate.ToString();
            dto.Id = 51;

            DataSet ds = DON_DAO.JIDN_NumberingDB(dto);

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

            DNNumber_DTO dto = new DNNumber_DTO();

            dto.DNN_Date = startDate.ToString();
            dto.DNN_EndDate = endDate.ToString();
            dto.Id = 52;

            DataSet ds = DON_DAO.JIDN_NumberingDB(dto);

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

            DNNumber_DTO dto = new DNNumber_DTO();

            dto.DNN_Date = startDate.ToString();
            dto.DNN_EndDate = endDate.ToString();
            dto.Id = 53;

            DataSet ds = DON_DAO.JIDN_NumberingDB(dto);

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