using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobworkInward
{
    public class DFSJobworkInvoiceController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();

        public void GetJobworkInvoiceData()
        {
            JobworkInvoiceCreate_DTO DN_DTO = new JobworkInvoiceCreate_DTO();
            JobworkInvoice_DAO DN_DAO = new JobworkInvoice_DAO();
            DN_DTO.Header.JISVIH_InvoiceDate = DateTime.Now;
            DN_DTO.Header.JW_Inv_Id = 1;

            DataSet DS = new DataSet();
            DS = DN_DAO.JobworkInvoice(DN_DTO);
            ViewBag.Currency = Help.GetCat(DS.Tables[4]);
            ViewBag.UoM = Help.GetCat(DS.Tables[5]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[7]);
            ViewBag.AddressType = Help.GetCat(DS.Tables[11]);
            ViewBag.Process = Help.GetCat(DS.Tables[12]);
            ViewBag.SAC = Help.GetCat(DS.Tables[13]);
            ViewBag.SON = Help.GetCat(DS.Tables[14]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[15]);

        }

        public IActionResult JobworkInvoiceDefaultSetting()
        {
            JobworkInvoiceHead_DTO SH_DTO = new JobworkInvoiceHead_DTO();

            if (TempData["SH_DTO_Json"] is string SHto)
            {
                SH_DTO = System.Text.Json.JsonSerializer.Deserialize<JobworkInvoiceHead_DTO>(SHto);
            }

            GetJobworkInvoiceData();

            DFS_JI_JobworkInvoiceDAO dao = new DFS_JI_JobworkInvoiceDAO();
            DataSet ds = dao.JI_JobworkInvoiceGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                SH_DTO.JISVIH_Number = Convert.ToInt64(row["DFS_JISVIH_Number"]);
                SH_DTO.JISVIH_JW_Customer_Number = Convert.ToInt64(row["DFS_JISVIH_JW_Customer_Number"]);
                SH_DTO.JISVIH_JW_Customer_Name = Convert.ToString(row["CUS_Name"]);

                SH_DTO.JISVIH_Currency_Number = Convert.ToInt64(row["DFS_JISVIH_Currency_Number"]);
                SH_DTO.JISVIH_MS_Number = Convert.ToInt64(row["DFS_JISVIH_MS_Number"]);
                SH_DTO.JISVIH_TCT_Number = Convert.ToInt64(row["DFS_JISVIH_TCT_Number"]);
                SH_DTO.JISVIH_PaymentTerms = Convert.ToString(row["DFS_JISVIH_PaymentTerms"]);
                SH_DTO.JISVIH_PaymentMethod = Convert.ToString(row["DFS_JISVIH_PaymentMethod"]);
                SH_DTO.JISVIH_Remarks = Convert.ToString(row["DFS_JISVIH_Remarks"]);
            }

            ViewBag.Collapse = true;

            return View(SH_DTO);
        }

        [HttpPost]
        [Route("jobinward/transactions/jobwork-invoice/save")]
        public IActionResult SaveJobworkInvoice([FromBody] JobworkInvoiceHead_DTO S_DTO)
        {
            try
            {
              

                JobworkInvoice_DTO SI_DTO = new JobworkInvoice_DTO();
                DFS_JI_JobworkInvoiceDAO SI_DAO = new DFS_JI_JobworkInvoiceDAO();

                SI_DTO.JISVIH_JW_Customer_Number = S_DTO.JISVIH_JW_Customer_Number;
                SI_DTO.JISVIH_Currency_Number = S_DTO.JISVIH_Currency_Number;
                SI_DTO.JISVIH_MS_Number = S_DTO.JISVIH_MS_Number;
                SI_DTO.JISVIH_TCT_Number = S_DTO.JISVIH_TCT_Number;
                SI_DTO.JISVIH_PaymentTerms = S_DTO.JISVIH_PaymentTerms;
                SI_DTO.JISVIH_PaymentMethod = S_DTO.JISVIH_PaymentMethod;
                SI_DTO.JISVIH_Remarks = S_DTO.JISVIH_Remarks;

                SI_DAO.JI_JobworkInvoiceDB(SI_DTO);

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
        [Route("jobinward/transactions/jobwork-invoice/get")]
        public IActionResult GetJobworkInvoice()
        {
            DFS_JI_JobworkInvoiceDAO dao = new DFS_JI_JobworkInvoiceDAO();

            DataSet ds = dao.JI_JobworkInvoiceGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        dfS_JISVIH_Number = row["DFS_JISVIH_Number"],
                        dfS_JISVIH_JW_Customer_Number = row["DFS_JISVIH_JW_Customer_Number"],
                        cuS_Name = row["CUS_Name"],
                        dfS_JISVIH_Currency_Number = row["DFS_JISVIH_Currency_Number"],
                        currency_Name = row["Currency_Name"],
                        dfS_JISVIH_TCT_Number = row["DFS_JISVIH_TCT_Number"],
                        dfS_JISVIH_PaymentTerms = row["DFS_JISVIH_PaymentTerms"],
                        dfS_JISVIH_MS_Number = row["DFS_JISVIH_MS_Number"],
                        dfS_JISVIH_PaymentMethod = row["DFS_JISVIH_PaymentMethod"],
                        dfS_JISVIH_Remarks = row["DFS_JISVIH_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }
  
    
    }


}
