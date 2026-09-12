using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Globalization;

namespace ERP.Controllers.JobworkInward
{
    public class JIFTI_NumberController : Controller
    {
        DataSet DS = new DataSet();
        Help Help = new Help();
        //FREIGHT INVOICE NUMBERING
        JIFTI_Numbering_DTO FON_DTO = new JIFTI_Numbering_DTO();
        JIFTI_Numbering_DAO FON_DAO = new JIFTI_Numbering_DAO();
        JIFTI_Numbering_DL FON_DL = new JIFTI_Numbering_DL();

        List<JIFTI_NumberReset_DTO> FOR_List = new List<JIFTI_NumberReset_DTO>();
        List<JIFTI_NumberPrefix_DTO> FOP_List = new List<JIFTI_NumberPrefix_DTO>();
        List<JIFTI_NumberSuffix_DTO> FOS_List = new List<JIFTI_NumberSuffix_DTO>();
        public IActionResult Index()
        {
            return View();
        }
        // Freight Invoice Numbering
        [Route("freightinvoice/setup/freightinvoice-numbering")]
        public IActionResult FTINumbering()
        {
            GetFTINumber();
            return View("~/Views/JobworkInward/FreightInvoice/FreightInvoiceNumber/FTINumbering.cshtml", FON_DTO);
        }
        void GetFTINumber()
        {
            FON_DTO.CreatorCode = Convert.ToInt32(1);
            FON_DTO.Id = 1;
            DS = FON_DAO.JIFTI_NumberingDB(FON_DTO);

            ViewBag.Method = Help.GetCat(DS.Tables[0]);
            ViewBag.Frequency = Help.GetCat(DS.Tables[1]);
            ViewBag.Prefil = Help.GetCat(DS.Tables[2]);

            if (DS.Tables[3].Rows.Count > 0)
            {
                FON_DTO.JIFTI_Number = Convert.ToInt64(DS.Tables[3].Rows[0]["JIFTI_Number"]);
                FON_DTO.JIFTI_Method = DS.Tables[3].Rows[0]["JIFTI_Method"].ToString();
            }

            FON_DTO.JIFTI_NumberReset = FON_DL.JIFTI_NRList(DS.Tables[4]);
            FON_DTO.JIFTI_NumberPrefix = FON_DL.JIFTI_PrefixList(DS.Tables[5]);
            FON_DTO.JIFTI_NumberSuffix = FON_DL.JIFTI_SuffixList(DS.Tables[6]);
        }

        [Route("freightinvoice/setup/freightinvoice-numbering")]
        [HttpPost]
        public IActionResult FTINumbering(JIFTI_Numbering_DTO PN_DTO)
        {
            bool IsValid = false;
            JIFTI_Numbering_DTO P_Head_DTO = new JIFTI_Numbering_DTO();

            List<JIFTI_NumberReset_DTO>? Reset_DTO = new List<JIFTI_NumberReset_DTO>();
            List<JIFTI_NumberPrefix_DTO>? Prefix_DTO = new List<JIFTI_NumberPrefix_DTO>();
            List<JIFTI_NumberSuffix_DTO>? Suffix_DTO = new List<JIFTI_NumberSuffix_DTO>();

            P_Head_DTO = FON_DTO;

            if (PN_DTO.JIFTI_NumberReset != null)
                Reset_DTO = PN_DTO.JIFTI_NumberReset!.Where(K => !K.JIFTI_NRS_IsDeleted).ToList();

            if (PN_DTO.JIFTI_NumberPrefix != null)
                Prefix_DTO = PN_DTO.JIFTI_NumberPrefix!.Where(K => !K.JIFTI_PFX_IsDeleted).ToList();

            if (PN_DTO.JIFTI_NumberSuffix != null)
                Suffix_DTO = PN_DTO.JIFTI_NumberSuffix!.Where(K => !K.JIFTI_SFX_IsDeleted).ToList();
            PN_DTO.JIFTI_Method = "2";
            if (PN_DTO.JIFTI_Method == "2")
            {
                String ResetDTO = string.Join(", ", Reset_DTO.Where(x => Convert.ToInt64(x.JIFTI_NRS_Number) != 0).Select(x => x.JIFTI_NRS_Number));
                String PrefixDTO = string.Join(", ", Prefix_DTO.Where(x => Convert.ToInt64(x.JIFTI_PFX_Number) != 0).Select(x => x.JIFTI_PFX_Number));
                String SuffixDTO = string.Join(", ", Suffix_DTO.Where(x => Convert.ToInt64(x.JIFTI_SFX_Number) != 0).Select(x => x.JIFTI_SFX_Number));

                FON_DTO.CreatorCode = Convert.ToInt32(1);
                FON_DTO.DeleteNumbers = Convert.ToString(ResetDTO);
                FON_DTO.Id = 31;
                FON_DAO.JIFTI_NumberingDB(FON_DTO);

                FON_DTO.DeleteNumbers = Convert.ToString(PrefixDTO);
                FON_DTO.Id = 32;
                FON_DAO.JIFTI_NumberingDB(FON_DTO);

                FON_DTO.DeleteNumbers = Convert.ToString(SuffixDTO);
                FON_DTO.Id = 33;
                FON_DAO.JIFTI_NumberingDB(FON_DTO);

                FON_DTO.JIFTI_Method = PN_DTO.JIFTI_Method;
                if (PN_DTO.JIFTI_Number == 0)
                {
                    FON_DTO.Id = 11;
                }
                else
                {
                    FON_DTO.Id = 41;
                    FON_DTO.JIFTI_Number = PN_DTO.JIFTI_Number;
                }
                FON_DAO.JIFTI_NumberingDB(FON_DTO);

                foreach (var Reset in Reset_DTO)
                {
                    FON_DTO.JIFTI_Date = Convert.ToString(Convert.ToDateTime(Reset.JIFTI_NRS_StartDate).ToString("yyyyMMdd"));
                    FON_DTO.JIFTI_EndDate = Convert.ToString(Convert.ToDateTime(Reset.JIFTI_NRS_EndDate).ToString("yyyyMMdd"));
                    FON_DTO.JIFTI_StartingNumber = Convert.ToInt32(Reset.JIFTI_NRS_StartingNumber).ToString();
                    FON_DTO.JIFTI_NumberofDigits = Convert.ToInt32(Reset.JIFTI_NRS_NumberofDigits).ToString();
                    FON_DTO.JIFTI_PrefilZero = Convert.ToInt64(Reset.JIFTI_NRS_PrefilZero).ToString();
                    FON_DTO.JIFTI_Frequency = Convert.ToInt64(Reset.JIFTI_NRS_Frequency).ToString();

                    if (Reset.JIFTI_NRS_Number == 0)
                    {
                        FON_DTO.Id = 12;
                    }
                    else
                    {
                        FON_DTO.Id = 42;
                        FON_DTO.JIFTI_Number = Reset.JIFTI_NRS_Number;
                    }

                    FON_DAO.JIFTI_NumberingDB(FON_DTO);
                }

                foreach (var Prefix in Prefix_DTO)
                {
                    FON_DTO.JIFTI_Date = Convert.ToString(Convert.ToDateTime(Prefix.JIFTI_PFX_StartDate).ToString("yyyyMMdd"));
                    FON_DTO.JIFTI_EndDate = Convert.ToString(Convert.ToDateTime(Prefix.JIFTI_PFX_EndDate).ToString("yyyyMMdd"));
                    FON_DTO.JIFTI_Particulars = Convert.ToString(Prefix.JIFTI_PFX_Particulars);

                    if (Prefix.JIFTI_PFX_Number == 0)
                    {
                        FON_DTO.Id = 13;
                    }
                    else
                    {
                        FON_DTO.Id = 43;
                        FON_DTO.JIFTI_Number = Prefix.JIFTI_PFX_Number;
                    }

                    FON_DAO.JIFTI_NumberingDB(FON_DTO);
                }

                foreach (var Suffix in Suffix_DTO)
                {
                    FON_DTO.JIFTI_Date = Convert.ToString(Convert.ToDateTime(Suffix.JIFTI_SFX_StartDate).ToString("yyyyMMdd"));
                    FON_DTO.JIFTI_EndDate = Convert.ToString(Convert.ToDateTime(Suffix.JIFTI_SFX_EndDate).ToString("yyyyMMdd"));
                    FON_DTO.JIFTI_Particulars = Convert.ToString(Suffix.JIFTI_SFX_Particulars);

                    if (Suffix.JIFTI_SFX_Number == 0)
                    {
                        FON_DTO.Id = 14;
                    }
                    else
                    {
                        FON_DTO.Id = 44;
                        FON_DTO.JIFTI_Number = Suffix.JIFTI_SFX_Number;
                    }

                    FON_DAO.JIFTI_NumberingDB(FON_DTO);
                }

                FON_DTO.Reset();
                Reset_DTO = null;
                Prefix_DTO = null;
                Suffix_DTO = null;
                ModelState.Clear();
            }
            else if (PN_DTO.JIFTI_Method == "3")
            {
                FON_DTO.JIFTI_Method = PN_DTO.JIFTI_Method;

                if (PN_DTO.JIFTI_Number == 0)
                {
                    FON_DTO.Id = 21;
                }
                else
                {
                    FON_DTO.Id = 22;
                    FON_DTO.JIFTI_Number = PN_DTO.JIFTI_Number;
                }

                FON_DAO.JIFTI_NumberingDB(FON_DTO);
            }
            GetFTINumber();
            return View("~/Views/JobworkInward/FreightInvoice/FreightInvoiceNumber/FTINumbering.cshtml", FON_DTO);
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

            JIFTI_Numbering_DTO dto = new JIFTI_Numbering_DTO();

            dto.JIFTI_Date = startDate.ToString();
            dto.JIFTI_EndDate = endDate.ToString();
            dto.Id = 51;

            DataSet ds = FON_DAO.JIFTI_NumberingDB(dto);

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

            JIFTI_Numbering_DTO dto = new JIFTI_Numbering_DTO();

            dto.JIFTI_Date = startDate.ToString();
            dto.JIFTI_EndDate = endDate.ToString();
            dto.Id = 52;

            DataSet ds = FON_DAO.JIFTI_NumberingDB(dto);

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

            JIFTI_Numbering_DTO dto = new JIFTI_Numbering_DTO();

            dto.JIFTI_Date = startDate.ToString();
            dto.JIFTI_EndDate = endDate.ToString();
            dto.Id = 53;

            DataSet ds = FON_DAO.JIFTI_NumberingDB(dto);

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