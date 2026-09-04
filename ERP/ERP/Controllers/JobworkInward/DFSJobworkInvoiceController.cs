using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobworkInward
{
    public class DFSJobWorkInvoiceController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();

        public void GetJobWorkInvoiceData()
        {
            JobWorkInvoiceCreate_DTO DN_DTO = new JobWorkInvoiceCreate_DTO();
            JobWorkInvoice_DAO DN_DAO = new JobWorkInvoice_DAO();
            DN_DTO.Header.JIJWIH_InvoiceDate = DateTime.Now;
            DN_DTO.Header.JW_Inv_Id = 1;

            DataSet DS = new DataSet();
            DS = DN_DAO.JobWorkInvoice(DN_DTO);
            ViewBag.Currency = Help.GetCat(DS.Tables[4]);
            ViewBag.UoM = Help.GetCat(DS.Tables[5]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[7]);
            ViewBag.AddressType = Help.GetCat(DS.Tables[11]);
            ViewBag.Process = Help.GetCat(DS.Tables[12]);
            ViewBag.SAC = Help.GetCat(DS.Tables[13]);
            ViewBag.SON = Help.GetCat(DS.Tables[14]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[15]);

        }

        public IActionResult JobWorkInvoiceDefaultSetting()
        {
            JobWorkInvoiceHead_DTO SH_DTO = new JobWorkInvoiceHead_DTO();

            if (TempData["SH_DTO_Json"] is string SHto)
            {
                SH_DTO = System.Text.Json.JsonSerializer.Deserialize<JobWorkInvoiceHead_DTO>(SHto);
            }

            GetJobWorkInvoiceData();

            JIJWI_DFS_DAO dao = new JIJWI_DFS_DAO();
            DataSet ds = dao.JI_JobWorkInvoiceGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                SH_DTO.JIJWIH_Number = Convert.ToInt64(row["JIJWI_DFS_Number"]);
                SH_DTO.JIJWIH_JW_Customer_Number = Convert.ToInt64(row["JIJWI_DFS_JW_Customer_Number"]);
                SH_DTO.JIJWIH_JW_Customer_Name = Convert.ToString(row["CUS_Name"]);

                SH_DTO.JIJWIH_Currency_Number = Convert.ToInt64(row["JIJWI_DFS_Currency_Number"]);
                SH_DTO.JIJWIH_MS_Number = Convert.ToInt64(row["JIJWI_DFS_MS_Number"]);
                SH_DTO.JIJWIH_TCT_Number = Convert.ToInt64(row["JIJWI_DFS_TCT_Number"]);
                SH_DTO.JIJWIH_PaymentTerms = Convert.ToString(row["JIJWI_DFS_PaymentTerms"]);
                SH_DTO.JIJWIH_PaymentMethod = Convert.ToString(row["JIJWI_DFS_PaymentMethod"]);
                SH_DTO.JIJWIH_Remarks = Convert.ToString(row["JIJWI_DFS_Remarks"]);
            }

            ViewBag.Collapse = true;

            return View(SH_DTO);
        }

        [HttpPost]
        [Route("jobinward/transactions/jobwork-invoice/save")]
        public IActionResult SaveJobWorkInvoice([FromBody] JobWorkInvoiceHead_DTO S_DTO)
        {
            try
            {


                JobWorkInvoice_DFS_DTO SI_DTO = new JobWorkInvoice_DFS_DTO();
                JIJWI_DFS_DAO SI_DAO = new JIJWI_DFS_DAO();

                SI_DTO.JIJWIH_JW_Customer_Number = S_DTO.JIJWIH_JW_Customer_Number;
                SI_DTO.JIJWIH_Currency_Number = S_DTO.JIJWIH_Currency_Number;
                SI_DTO.JIJWIH_MS_Number = S_DTO.JIJWIH_MS_Number;
                SI_DTO.JIJWIH_TCT_Number = S_DTO.JIJWIH_TCT_Number;
                SI_DTO.JIJWIH_PaymentTerms = S_DTO.JIJWIH_PaymentTerms;
                SI_DTO.JIJWIH_PaymentMethod = S_DTO.JIJWIH_PaymentMethod;
                SI_DTO.JIJWIH_Remarks = S_DTO.JIJWIH_Remarks;

                SI_DAO.JI_JobWorkInvoiceDB(SI_DTO);

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
        public IActionResult GetJobWorkInvoice()
        {
            JIJWI_DFS_DAO dao = new JIJWI_DFS_DAO();

            DataSet ds = dao.JI_JobWorkInvoiceGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        jijwI_DFS_Number = row["JIJWI_DFS_Number"],
                        jijwI_DFS_JW_Customer_Number = row["JIJWI_DFS_JW_Customer_Number"],
                        cuS_Name = row["CUS_Name"],
                        jijwI_DFS_Currency_Number = row["JIJWI_DFS_Currency_Number"],
                        currency_Name = row["Currency_Name"],
                        jijwI_DFS_TCT_Number = row["JIJWI_DFS_TCT_Number"],
                        jijwI_DFS_PaymentTerms = row["JIJWI_DFS_PaymentTerms"],
                        jijwI_DFS_MS_Number = row["JIJWI_DFS_MS_Number"],
                        jijwI_DFS_PaymentMethod = row["JIJWI_DFS_PaymentMethod"],
                        jijwI_DFS_Remarks = row["JIJWI_DFS_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }


    }


}