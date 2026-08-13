using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobworkInward
{

    public class DFSConversionController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();

        public void GetConversionData()
        {
            ConversionCreate_DTO DN_DTO = new ConversionCreate_DTO();
            Conversion_DAO DN_DAO = new Conversion_DAO();
            DN_DTO.Header.JIDNH_DN_Date = DateTime.Now;
            DN_DTO.Header.DN_Id = 1;
            DataSet DS = new DataSet();
            DS = DN_DAO.ConversionDB(DN_DTO);
            ViewBag.Currency = Help.GetCat(DS.Tables[4]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[5]);
            ViewBag.UoM = Help.GetCat(DS.Tables[6]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[8]);
            ViewBag.AddressType = Help.GetCat(DS.Tables[12]);
            ViewBag.Process = Help.GetCat(DS.Tables[13]);
            ViewBag.SON = Help.GetCat(DS.Tables[14]);
            ViewBag.Shift = Help.GetCat(DS.Tables[15]);
            ViewBag.WorkCentre = Help.GetCat(DS.Tables[16]);
        }

        public IActionResult ConversionDefaultSetting()
        {
            ConversionHeader_DTO SH_DTO = new ConversionHeader_DTO();

            GetConversionData();

            DFS_JI_ConversionDAO dao = new DFS_JI_ConversionDAO();
            DataSet ds = dao.JI_ConversionGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                SH_DTO.JIDNH_Number = Convert.ToInt64(row["DFS_JICNVH_Number"]);
                SH_DTO.JIDNH_Shift_Number = Convert.ToInt64(row["DFS_JICNVH_SFT_Number"]);
                SH_DTO.JIDNH_WC_Number = Convert.ToInt64(row["DFS_JICNVH_WC_Number"]);
                SH_DTO.JIDNH_Operator_Number = Convert.ToString(row["DFS_JICNVH_Operator"]);
                SH_DTO.JIDNH_PRS_Number = Convert.ToInt64(row["DFS_JICNVH_PRS_Number"]);
                SH_DTO.JIDNH_MS_Number = Convert.ToInt64(row["DFS_JICNVH_MS_Number"]);
            }

            ViewBag.Collapse = true;

            return View(SH_DTO);
        }
        [HttpPost]
        [Route("jobinward/transactions/conversion/save")]
        public IActionResult SaveConversion([FromBody] ConversionHeader_DTO S_DTO)
        {
            try
            {
                Conversion_DTO SI_DTO = new Conversion_DTO();
                DFS_JI_ConversionDAO SI_DAO = new DFS_JI_ConversionDAO();

                SI_DTO.JICNVH_SFT_Number = S_DTO.JIDNH_Shift_Number;
                SI_DTO.JICNVH_MS_Number = S_DTO.JIDNH_MS_Number;
                SI_DTO.JICNVH_WC_Number = S_DTO.JIDNH_WC_Number;
                SI_DTO.JICNVH_Operator = long.TryParse(S_DTO.JIDNH_Operator_Number, out var op) ? op : 0;
                SI_DTO.JICNVH_PRS_Number = S_DTO.JIDNH_PRS_Number;

                SI_DAO.JI_ConversionDB(SI_DTO);

                if (SI_DTO.Result_Number == 1)
                {
                    return Json(new { success = true });
                }

                return Json(new { success = false, message = SI_DTO.Result_Message });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
      
        [HttpGet]
        [Route("jobinward/transactions/conversion/get")]
        public IActionResult GetConversion()
        {
            DFS_JI_ConversionDAO dao = new DFS_JI_ConversionDAO();

            DataSet ds = dao.JI_ConversionGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        dfS_JICNVH_Number = row["DFS_JICNVH_Number"],
                        dfS_JICNVH_SFT_Number = row["DFS_JICNVH_SFT_Number"],
                        dfS_JICNVH_WC_Number = row["DFS_JICNVH_WC_Number"],
                        dfS_JICNVH_Operator = row["DFS_JICNVH_Operator"],
                        dfS_JICNVH_MS_Number = row["DFS_JICNVH_MS_Number"],
                        dfS_JICNVH_PRS_Number = row["DFS_JICNVH_PRS_Number"]
                    }
                });
            }

            return Json(new { success = false });
        }
   
    }
}
