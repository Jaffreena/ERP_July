using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobworkInward
{
    public class JIFTI_DFSController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();

        public void GetFreightInvoiceData()
        {
            FreightInvoiceCreate_DTO DN_DTO = new FreightInvoiceCreate_DTO();
            FreightInvoice_DAO DN_DAO = new FreightInvoice_DAO();
            DN_DTO.Header.JIFTIH_InvoiceDate = DateTime.Now;

            DataSet DS = new DataSet();
            DS = DN_DAO.FreightInvoice(DN_DTO);
            ViewBag.Currency = Help.GetCat(DS.Tables[4]);
            ViewBag.UoM = Help.GetCat(DS.Tables[5]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[7]);
            ViewBag.AddressType = Help.GetCat(DS.Tables[11]);
            ViewBag.Process = Help.GetCat(DS.Tables[12]);
            ViewBag.SAC = Help.GetCat(DS.Tables[13]);
            ViewBag.SON = Help.GetCat(DS.Tables[14]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[15]);
        }

        public IActionResult FreightInvoiceDefaultSetting()
        {
            FreightInvoiceHead_DTO SH_DTO = new FreightInvoiceHead_DTO();

            if (TempData["SH_DTO_Json"] is string SHto)
            {
                SH_DTO = System.Text.Json.JsonSerializer.Deserialize<FreightInvoiceHead_DTO>(SHto);
            }

            GetFreightInvoiceData();

            JIFTI_DFS_DAO dao = new JIFTI_DFS_DAO();
            DataSet ds = dao.JI_FreightInvoiceGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                SH_DTO.JIFTIH_Number = Convert.ToInt64(row["JIFTI_DFS_Number"]);
                SH_DTO.JIFTIH_JW_Customer_Number = Convert.ToInt64(row["JIFTI_DFS_JW_Customer_Number"]);
                SH_DTO.JIFTIH_JW_Customer_Name = Convert.ToString(row["CUS_Name"]);

                SH_DTO.JIFTIH_Currency_Number = Convert.ToInt64(row["JIFTI_DFS_Currency_Number"]);
                SH_DTO.JIFTIH_TCT_Number = Convert.ToInt64(row["JIFTI_DFS_TCT_Number"]);
                SH_DTO.JIFTIH_PaymentTerms = Convert.ToString(row["JIFTI_DFS_PaymentTerms"]);
                SH_DTO.JIFTIH_PaymentMethod = Convert.ToString(row["JIFTI_DFS_PaymentMethod"]);
                SH_DTO.JIFTIH_Remarks = Convert.ToString(row["JIFTI_DFS_Remarks"]);
                SH_DTO.JIFTIH_MS_Number = row["JIFTI_DFS_MS_Number"] != DBNull.Value ? Convert.ToInt64(row["JIFTI_DFS_MS_Number"]) : 0;
                SH_DTO.JIFTIH_SourceCategory = Convert.ToString(row["JIFTI_DFS_Category"]);
            }

            ViewBag.Collapse = true;

            return View("~/Views/JobworkInward/FreightInvoice/JIFTI_DFS/FreightInvoiceDefaultSetting.cshtml", SH_DTO);
        }

        [HttpPost]
        [Route("jobinward/transactions/freight-invoice/save")]
        public IActionResult SaveFreightInvoice([FromBody] FreightInvoiceHead_DTO S_DTO)
        {
            try
            {
                JIFTI_DFS_DTO SI_DTO = new JIFTI_DFS_DTO();
                JIFTI_DFS_DAO SI_DAO = new JIFTI_DFS_DAO();

                SI_DTO.JIFTI_DFS_JW_Customer_Number = S_DTO.JIFTIH_JW_Customer_Number;
                SI_DTO.JIFTI_DFS_Currency_Number = S_DTO.JIFTIH_Currency_Number;
                SI_DTO.JIFTI_DFS_TCT_Number = S_DTO.JIFTIH_TCT_Number;
                SI_DTO.JIFTI_DFS_PaymentTerms = S_DTO.JIFTIH_PaymentTerms;
                SI_DTO.JIFTI_DFS_PaymentMethod = S_DTO.JIFTIH_PaymentMethod;
                SI_DTO.JIFTI_DFS_Remarks = S_DTO.JIFTIH_Remarks;
                SI_DTO.JIFTI_DFS_MS_Number = S_DTO.JIFTIH_MS_Number;
                SI_DTO.JIFTI_DFS_Category = S_DTO.JIFTIH_SourceCategory;

                SI_DAO.JI_FreightInvoiceDB(SI_DTO);

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
        [Route("jobinward/transactions/freight-invoice/get")]
        public IActionResult GetFreightInvoice()
        {
            JIFTI_DFS_DAO dao = new JIFTI_DFS_DAO();

            DataSet ds = dao.JI_FreightInvoiceGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        jiftI_DFS_Number = row["JIFTI_DFS_Number"],
                        jiftI_DFS_JW_Customer_Number = row["JIFTI_DFS_JW_Customer_Number"],
                        cuS_Name = row["CUS_Name"],
                        jiftI_DFS_Currency_Number = row["JIFTI_DFS_Currency_Number"],
                        currency_Name = row["Currency_Name"],
                        jiftI_DFS_TCT_Number = row["JIFTI_DFS_TCT_Number"],
                        jiftI_DFS_PaymentTerms = row["JIFTI_DFS_PaymentTerms"],
                        jiftI_DFS_PaymentMethod = row["JIFTI_DFS_PaymentMethod"],
                        jiftI_DFS_Remarks = row["JIFTI_DFS_Remarks"],
                        jiftI_DFS_MS_Number = row["JIFTI_DFS_MS_Number"],
                        jiftI_DFS_Category = row["JIFTI_DFS_Category"]
                    }
                });
            }

            return Json(new { success = false });
        }
    }
}