using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobworkInward
{
    public class DeliveryNoteNumberController : Controller
    {
        DataSet DS = new DataSet();
        Help Help = new Help();
        //DN NUMBERING
        DNNumber_DTO DON_DTO = new DNNumber_DTO();
        DNNumber_DAO DON_DAO = new DNNumber_DAO();
        DNNumbering_DL DON_DL = new DNNumbering_DL();

        List<DNNumberReset_DTO> DOR_List = new List<DNNumberReset_DTO>();
        List<DNNumberPrefix_DTO> DOP_List = new List<DNNumberPrefix_DTO>();
        List<DNNumberSuffix_DTO> DOS_List = new List<DNNumberSuffix_DTO>();
        public IActionResult Index()
        {
            return View();
        }
        // Delivery Note Numbering
        [Route("deliverynote/setup/deliverynote-numbering")]
        public IActionResult DNNumbering()
        {
            GetDNNumber();
            return View(DON_DTO);
        }
        void GetDNNumber()
        {
            DON_DTO.CreatorCode = Convert.ToInt32(1);
            DON_DTO.Id = 1;
            DS = DON_DAO.DNNumberDB(DON_DTO);

            ViewBag.Method = Help.GetCat(DS.Tables[0]);
            ViewBag.Frequency = Help.GetCat(DS.Tables[1]);
            ViewBag.Prefil = Help.GetCat(DS.Tables[2]);

            if (DS.Tables[3].Rows.Count > 0)
            {
                DON_DTO.DNN_Number = Convert.ToInt64(DS.Tables[3].Rows[0]["DNN_Number"]);
                DON_DTO.DNN_Method = DS.Tables[3].Rows[0]["DNN_Method"].ToString();
            }

            DON_DTO.DNNumberReset = DON_DL.DORList(DS.Tables[4]);
            DON_DTO.DNNumberPrefix = DON_DL.DOPList(DS.Tables[5]);
            DON_DTO.DNNumberSuffix = DON_DL.DOSList(DS.Tables[6]);
        }

        [Route("deliverynote/setup/deliverynote-numbering")]
        [HttpPost]
        public IActionResult DNNumbering(DNNumber_DTO PN_DTO)
        {
            bool IsValid = false;
            DNNumber_DTO P_Head_DTO = new DNNumber_DTO();

            List<DNNumberReset_DTO>? Reset_DTO = new List<DNNumberReset_DTO>();
            List<DNNumberPrefix_DTO>? Prefix_DTO = new List<DNNumberPrefix_DTO>();
            List<DNNumberSuffix_DTO>? Suffix_DTO = new List<DNNumberSuffix_DTO>();

            P_Head_DTO = DON_DTO;

            if (PN_DTO.DNNumberReset != null)
                Reset_DTO = PN_DTO.DNNumberReset!.Where(K => !K.DNR_IsDeleted).ToList();

            if (PN_DTO.DNNumberPrefix != null)
                Prefix_DTO = PN_DTO.DNNumberPrefix!.Where(K => !K.DNP_IsDeleted).ToList();

            if (PN_DTO.DNNumberSuffix != null)
                Suffix_DTO = PN_DTO.DNNumberSuffix!.Where(K => !K.DNS_IsDeleted).ToList();

            if (PN_DTO.DNN_Method == "2")
            {
                String ResetDTO = string.Join(", ", Reset_DTO.Where(x => Convert.ToInt64(x.DNR_Number) != 0).Select(x => x.DNR_Number));
                String PrefixDTO = string.Join(", ", Prefix_DTO.Where(x => Convert.ToInt64(x.DNP_Number) != 0).Select(x => x.DNP_Number));
                String SuffixDTO = string.Join(", ", Suffix_DTO.Where(x => Convert.ToInt64(x.DNS_Number) != 0).Select(x => x.DNS_Number));

                DON_DTO.CreatorCode = Convert.ToInt32(1);
                DON_DTO.DeleteNumbers = Convert.ToString(ResetDTO);
                DON_DTO.Id = 31;
                DON_DAO.DNNumberDB(DON_DTO);

                DON_DTO.DeleteNumbers = Convert.ToString(PrefixDTO);
                DON_DTO.Id = 32;
                DON_DAO.DNNumberDB(DON_DTO);

                DON_DTO.DeleteNumbers = Convert.ToString(SuffixDTO);
                DON_DTO.Id = 33;
                DON_DAO.DNNumberDB(DON_DTO);

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
                DON_DAO.DNNumberDB(DON_DTO);

                foreach (var Reset in Reset_DTO)
                {
                    DON_DTO.DNN_Date = Convert.ToString(Convert.ToDateTime(Reset.DNR_Date).ToString("yyyyMMdd"));
                    DON_DTO.DNN_EndDate = Convert.ToString(Convert.ToDateTime(Reset.DNR_EndDate).ToString("yyyyMMdd"));
                    DON_DTO.DNN_StartingNumber = Convert.ToInt32(Reset.DNR_StartingNumber).ToString();
                    DON_DTO.DNN_NumberofDigits = Convert.ToInt32(Reset.DNR_NumberofDigits).ToString();
                    DON_DTO.DNN_PrefilZero = Convert.ToInt64(Reset.DNR_PrefilZero).ToString();
                    DON_DTO.DNN_Frequency = Convert.ToInt64(Reset.DNR_Frequency).ToString();

                    if (Reset.DNR_Number == 0)
                    {
                        DON_DTO.Id = 12;
                    }
                    else
                    {
                        DON_DTO.Id = 42;
                        DON_DTO.DNN_Number = Reset.DNR_Number;
                    }

                    DON_DAO.DNNumberDB(DON_DTO);
                }

                foreach (var Prefix in Prefix_DTO)
                {
                    DON_DTO.DNN_Date = Convert.ToString(Convert.ToDateTime(Prefix.DNP_Date).ToString("yyyyMMdd"));
                    DON_DTO.DNN_EndDate = Convert.ToString(Convert.ToDateTime(Prefix.DNP_EndDate).ToString("yyyyMMdd"));
                    DON_DTO.DNN_Particulars = Convert.ToString(Prefix.DNP_Particulars);

                    if (Prefix.DNP_Number == 0)
                    {
                        DON_DTO.Id = 13;
                    }
                    else
                    {
                        DON_DTO.Id = 43;
                        DON_DTO.DNN_Number = Prefix.DNP_Number;
                    }

                    DON_DAO.DNNumberDB(DON_DTO);
                }

                foreach (var Suffix in Suffix_DTO)
                {
                    DON_DTO.DNN_Date = Convert.ToString(Convert.ToDateTime(Suffix.DNS_Date).ToString("yyyyMMdd"));
                    DON_DTO.DNN_EndDate = Convert.ToString(Convert.ToDateTime(Suffix.DNS_EndDate).ToString("yyyyMMdd"));
                    DON_DTO.DNN_Particulars = Convert.ToString(Suffix.DNS_Particulars);

                    if (Suffix.DNS_Number == 0)
                    {
                        DON_DTO.Id = 14;
                    }
                    else
                    {
                        DON_DTO.Id = 44;
                        DON_DTO.DNN_Number = Suffix.DNS_Number;
                    }

                    DON_DAO.DNNumberDB(DON_DTO);
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

                DON_DAO.DNNumberDB(DON_DTO);
            }
            GetDNNumber();
            return View(DON_DTO);
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

            DataSet ds = DON_DAO.DNNumberDB(dto);

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

            DataSet ds = DON_DAO.DNNumberDB(dto);

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

            DataSet ds = DON_DAO.DNNumberDB(dto);

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
