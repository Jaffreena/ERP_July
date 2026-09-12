using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobworkInward
{
    public class JIDN_DFSController : Controller
    {
        Help Help = new Help();
        DataSet DS = new DataSet();
        public void GetDevliverNoteData()
        {
            DeliveryNoteCreate_DTO DN_DTO = new DeliveryNoteCreate_DTO();
            DeliveryNote_DAO DN_DAO = new DeliveryNote_DAO();
            DN_DTO.Header.JIDNH_DN_Date = DateTime.Now;
            DN_DTO.Header.DN_Id = 1;
            DataSet DS = new DataSet();
            DS = DN_DAO.DeliveryNoteDB(DN_DTO);
            ViewBag.Currency = Help.GetCat(DS.Tables[4]);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[5]);
            ViewBag.UoM = Help.GetCat(DS.Tables[6]);
            ViewBag.Warehouse = Help.GetCat(DS.Tables[8]);
            ViewBag.AddressType = Help.GetCat(DS.Tables[12]);
            ViewBag.Process = Help.GetCat(DS.Tables[13]);
            ViewBag.SON = Help.GetCat(DS.Tables[14]);
        }
        public IActionResult DeliveryNoteDefaultSetting()
        {
            DeliveryNoteHeader_DTO SH_DTO = new DeliveryNoteHeader_DTO();

            if (TempData["SH_DTO_Json"] is string SHto)
            {
                SH_DTO = System.Text.Json.JsonSerializer.Deserialize<DeliveryNoteHeader_DTO>(SHto);
            }
            GetDevliverNoteData();
            JIDN_DFS_DAO dao = new JIDN_DFS_DAO();
            DataSet ds = dao.JI_DeliveryNoteGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                SH_DTO.JIDNH_Number = Convert.ToInt64(row["JIDN_DFS_Number"]);
                SH_DTO.JIDNH_MS_Number = Convert.ToInt64(row["JIDN_DFS_MS_Number"]);
                SH_DTO.JIDNH_JW_Customer_Number = Convert.ToInt64(row["JIDN_DFS_JW_Customer_Number"]);
                SH_DTO.JIDNH_JW_Customer_Name = Convert.ToString(row["CUS_Name"]);

                SH_DTO.JIDNH_Currency_Number = Convert.ToInt64(row["JIDN_DFS_Currency_Number"]);
                SH_DTO.JIDNH_CurrencyCode = Convert.ToString(row["Currency_Name"]);
                SH_DTO.JIDNH_WH_Number = Convert.ToInt64(row["JIDN_DFS_WH_Number"]);
                SH_DTO.JIDNH_PaymentTerms = Convert.ToString(row["JIDN_DFS_PaymentTerms"]);
                SH_DTO.JIDNH_DeliveryTerms = Convert.ToString(row["JIDN_DFS_DeliveryTerms"]);
                SH_DTO.JIDNH_DeliveryMode = Convert.ToString(row["JIDN_DFS_DeliveryMode"]);
                SH_DTO.JIDNH_DespatchDocumentNo = Convert.ToString(row["JIDN_DFS_DespatchDocument"]);
                SH_DTO.JIDNH_DespatchedThrough = Convert.ToString(row["JIDN_DFS_DespatchedThrough"]);
                SH_DTO.JIDNH_Remarks = Convert.ToString(row["JIDN_DFS_Remarks"]);
            }

            ViewBag.Collapse = true;

            return View("~/Views/JobworkInward/DeliveryNote/DeliveryNoteDefaultSetting.cshtml", SH_DTO);
        }

        [HttpPost]
        [Route("jobinward/transactions/delivery-note/save")]
        public IActionResult SaveDeliveryNote([FromBody] DeliveryNoteCreate_DTO dto)
        {
            try
            {
                DeliveryNoteHeader_DTO S_DTO = dto.Header;

                DeliveryNote_DTO SI_DTO = new DeliveryNote_DTO();
                JIDN_DFS_DAO SI_DAO = new JIDN_DFS_DAO();

                SI_DTO.JIDNH_MS_Number = S_DTO.JIDNH_MS_Number;
                SI_DTO.JIDNH_JW_Customer_Number = S_DTO.JIDNH_JW_Customer_Number;
                SI_DTO.JIDNH_Currency_Number = S_DTO.JIDNH_Currency_Number;
                SI_DTO.JIDNH_WH_Number = S_DTO.JIDNH_WH_Number;
                SI_DTO.JIDNH_PaymentTerms = S_DTO.JIDNH_PaymentTerms;
                SI_DTO.JIDNH_DeliveryTerms = S_DTO.JIDNH_DeliveryTerms;
                SI_DTO.JIDNH_DeliveryMode = S_DTO.JIDNH_DeliveryMode;
                SI_DTO.JIDNH_DespatchDocument = S_DTO.JIDNH_DespatchDocumentNo;
                SI_DTO.JIDNH_DespatchedThrough = S_DTO.JIDNH_DespatchedThrough;
                SI_DTO.JIDNH_Remarks = S_DTO.JIDNH_Remarks;

                SI_DAO.JI_DeliveryNoteDB(SI_DTO);

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
        [Route("jobinward/transactions/delivery-note/get")]
        public IActionResult GetDeliveryNote()
        {
            JIDN_DFS_DAO dao = new JIDN_DFS_DAO();

            DataSet ds = dao.JI_DeliveryNoteGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        jidN_DFS_Number = row["JIDN_DFS_Number"],
                        jidN_DFS_MS_Number = row["JIDN_DFS_MS_Number"],
                        jidN_DFS_JW_Customer_Number = row["JIDN_DFS_JW_Customer_Number"],
                        cuS_Name = row["CUS_Name"],
                        jidN_DFS_Currency_Number = row["JIDN_DFS_Currency_Number"],
                        currency_Name = row["Currency_Name"],
                        jidN_DFS_WH_Number = row["JIDN_DFS_WH_Number"],
                        jidN_DFS_PaymentTerms = row["JIDN_DFS_PaymentTerms"],
                        jidN_DFS_DeliveryTerms = row["JIDN_DFS_DeliveryTerms"],
                        jidN_DFS_DeliveryMode = row["JIDN_DFS_DeliveryMode"],
                        jidN_DFS_DespatchDocument = row["JIDN_DFS_DespatchDocument"],
                        jidN_DFS_DespatchedThrough = row["JIDN_DFS_DespatchedThrough"],
                        jidN_DFS_Remarks = row["JIDN_DFS_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }

    }
}
