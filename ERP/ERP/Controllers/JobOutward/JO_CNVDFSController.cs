using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.Data;

namespace ERP.Controllers.JobOutward
{
    public class JO_CNVDFSController : Controller
    {
        Help Help = new Help();

        // MS dropdown: old GetServiceOrderData() Tables[3]
        void LoadMaterialSegregation()
        {
            var SVO_DTO = new ERP_DTO.JobInwardTransaction.JI_ServiceOrder_DTO();
            var SVO_DAO = new ERP_DAO.JobInwardTransaction.ServiceOrder_DAO();

            SVO_DTO.Header.JISVOH_RegDate = DateTime.Now;
            SVO_DTO.Header.SVO_Id = 1;

            DataSet DS = SVO_DAO.ServiceOrderDB(SVO_DTO);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[3]);
        }

        static List<SelectListItem> ToList(DataTable dt)
        {
            var list = new List<SelectListItem> { new SelectListItem("-- Select --", "0") };
            foreach (DataRow r in dt.Rows)
                list.Add(new SelectListItem(Convert.ToString(r["Name"]), Convert.ToString(r["Id"])));
            return list;
        }

        public IActionResult ConversionDFS()
        {
            var dto = new JO_ConversionDFS_DTO();
            var dao = new JOCNV_DFS_DAO();

            LoadMaterialSegregation();

            DataSet dd = dao.JO_ConversionDFSDropdowns();
            ViewBag.Shift = ToList(dd.Tables[0]);
            ViewBag.Process = ToList(dd.Tables[1]);
            ViewBag.WorkCentre = ToList(dd.Tables[2]);

            DataSet ds = dao.JO_ConversionDFSGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                dto.JOCNV_DFS_Number = Convert.ToInt64(row["JOCNV_DFS_Number"]);
                dto.JOCNV_DFS_MS_Number = Convert.ToInt64(row["JOCNV_DFS_MS_Number"]);
                dto.JOCNV_DFS_JSFT_Number = Convert.ToInt64(row["JOCNV_DFS_JSFT_Number"]);
                dto.JOCNV_DFS_JPRS_Number = Convert.ToInt64(row["JOCNV_DFS_JPRS_Number"]);
                dto.JOCNV_DFS_JWWC_Number = Convert.ToInt64(row["JOCNV_DFS_JWWC_Number"]);
            }

            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JO_Conversion/DFS/JOConversionDFS.cshtml", dto);
        }

        [HttpPost]
        [Route("jobout/transactions/jo-conversion-dfs/save")]
        public IActionResult SaveConversionDFS([FromBody] JO_ConversionDFS_DTO dto)
        {
            try
            {
                new JOCNV_DFS_DAO().JO_ConversionDFSDB(dto);

                if (dto.Result_Number == 1)
                    return Json(new { success = true });

                return Json(new { success = false, message = dto.Result_Message });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }
    }
}
