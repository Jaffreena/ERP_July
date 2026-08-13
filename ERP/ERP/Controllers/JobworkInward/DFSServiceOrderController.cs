using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobworkInward
{
    public class DFSServiceOrderController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();

        public void GetServiceOrderData()
        {
            JI_ServiceOrder_DTO SVO_DTO = new JI_ServiceOrder_DTO();
            ServiceOrder_DAO SVO_DAO = new ServiceOrder_DAO();

            SVO_DTO.Header.JISVOH_RegDate = DateTime.Now;
            SVO_DTO.Header.SVO_Id = 1;

            DataSet DS = new DataSet();
            DS = SVO_DAO.ServiceOrderDB(SVO_DTO);

            ViewBag.Currency = Help.GetCat(DS.Tables[0]);
            ViewBag.UoM = Help.GetCat(DS.Tables[1]);

            ViewBag.Process = Help.GetCat(DS.Tables[2]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[3]);
        }

        public IActionResult ServiceOrderDefaultSetting()
        {
            JI_ServiceOrderHead_DTO SH_DTO = new JI_ServiceOrderHead_DTO();

            if (TempData["SH_DTO_Json"] is string SHto)
            {
                SH_DTO = System.Text.Json.JsonSerializer.Deserialize<JI_ServiceOrderHead_DTO>(SHto);
            }

            GetServiceOrderData();

            DFS_JI_ServiceOrderDAO dao = new DFS_JI_ServiceOrderDAO();
            DataSet ds = dao.JI_ServiceOrderGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                SH_DTO.JISVOH_Number = Convert.ToInt64(row["DFS_JISVOH_Number"]);
                SH_DTO.JISVOH_ServiceOrderNo = Convert.ToString(row["DFS_JISVOH_ServiceOrderNo"]);
                SH_DTO.JISVOH_JW_Customer_Number = Convert.ToInt64(row["DFS_JISVOH_JW_Customer_Number"]);
                SH_DTO.JISVOH_JW_Customer_Name = Convert.ToString(row["CUS_Name"]);

                SH_DTO.JISVOH_Currency_Number = Convert.ToInt64(row["DFS_JISVOH_Currency_Number"]);
             
                SH_DTO.JISVOH_PaymentTerms = Convert.ToString(row["DFS_JISVOH_PaymentTerms"]);
                SH_DTO.JISVOH_DeliveryTerms = Convert.ToString(row["DFS_JISVOH_DeliveryTerms"]);
                SH_DTO.JISVOH_DeliveryMode = Convert.ToString(row["DFS_JISVOH_DeliveryMode"]);
                SH_DTO.JISVOH_Tax = Convert.ToString(row["DFS_JISVOH_Tax"]);
                SH_DTO.JISVOH_TDC = Convert.ToString(row["DFS_JISVOH_TDC"]);
                SH_DTO.JISVOH_Remarks = Convert.ToString(row["DFS_JISVOH_Remarks"]);
                SH_DTO.JISVOH_MS_Number = Convert.ToInt64(row["DFS_JISVOH_MS_Number"]);
            }

            ViewBag.Collapse = true;

            return View(SH_DTO);
        }

        [HttpPost]
        [Route("jobinward/transactions/service-order/save")]
        public IActionResult SaveServiceOrder([FromBody] JI_ServiceOrderHead_DTO S_DTO)
        {
            try
            {
     

                ServiceOrder_DTO SI_DTO = new ServiceOrder_DTO();
                DFS_JI_ServiceOrderDAO SI_DAO = new DFS_JI_ServiceOrderDAO();

                SI_DTO.JISVOH_ServiceOrderNo = S_DTO.JISVOH_ServiceOrderNo;
                SI_DTO.JISVOH_JW_Customer_Number = S_DTO.JISVOH_JW_Customer_Number;
                SI_DTO.JISVOH_Currency_Number = S_DTO.JISVOH_Currency_Number;
                SI_DTO.JISVOH_MS_Number = S_DTO.JISVOH_MS_Number;
                SI_DTO.JISVOH_PaymentTerms = S_DTO.JISVOH_PaymentTerms;
                SI_DTO.JISVOH_DeliveryTerms = S_DTO.JISVOH_DeliveryTerms;
                SI_DTO.JISVOH_DeliveryMode = S_DTO.JISVOH_DeliveryMode;
                SI_DTO.JISVOH_Tax = S_DTO.JISVOH_Tax;
                SI_DTO.JISVOH_TDC = S_DTO.JISVOH_TDC;
                SI_DTO.JISVOH_Remarks = S_DTO.JISVOH_Remarks;

                SI_DAO.JI_ServiceOrderDB(SI_DTO);

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
        [Route("jobinward/transactions/service-order/get")]
        public IActionResult GetServiceOrder()
        {
            DFS_JI_ServiceOrderDAO dao = new DFS_JI_ServiceOrderDAO();

            DataSet ds = dao.JI_ServiceOrderGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        dfS_JISVOH_Number = row["DFS_JISVOH_Number"],
                        dfS_JISVOH_ServiceOrderNo = row["DFS_JISVOH_ServiceOrderNo"],
                        dfS_JISVOH_JW_Customer_Number = row["DFS_JISVOH_JW_Customer_Number"],
                        cuS_Name = row["CUS_Name"],
                        dfS_JISVOH_Currency_Number = row["DFS_JISVOH_Currency_Number"],
                        currency_Name = row["Currency_Name"],
                        dfS_JISVOH_PaymentTerms = row["DFS_JISVOH_PaymentTerms"],
                        dfS_JISVOH_DeliveryTerms = row["DFS_JISVOH_DeliveryTerms"],
                        dfS_JISVOH_DeliveryMode = row["DFS_JISVOH_DeliveryMode"],
                        dfS_JISVOH_Tax = row["DFS_JISVOH_Tax"],
                        dfS_JISVOH_TDC = row["DFS_JISVOH_TDC"],
                        dfS_JISVOH_MS_Number = row["DFS_JISVOH_MS_Number"],
                        dfS_JISVOH_Remarks = row["DFS_JISVOH_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }
   
    
    }

}
