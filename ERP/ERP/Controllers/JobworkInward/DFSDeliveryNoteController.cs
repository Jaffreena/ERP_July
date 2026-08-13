using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobworkInward
{
    public class DFSDeliveryNoteController : Controller
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
            DFS_JI_DeliveryNoteDAO dao = new DFS_JI_DeliveryNoteDAO();
            DataSet ds = dao.JI_DeliveryNoteGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                SH_DTO.JIDNH_Number = Convert.ToInt64(row["DFS_JIDNH_Number"]);
                SH_DTO.JIDNH_MS_Number = Convert.ToInt64(row["DFS_JIDNH_MS_Number"]);
                SH_DTO.JIDNH_JW_Customer_Number = Convert.ToInt64(row["DFS_JIDNH_JW_Customer_Number"]);
                SH_DTO.JIDNH_JW_Customer_Name = Convert.ToString(row["CUS_Name"]);

                SH_DTO.JIDNH_Currency_Number = Convert.ToInt64(row["DFS_JIDNH_Currency_Number"]);
                SH_DTO.JIDNH_CurrencyCode = Convert.ToString(row["Currency_Name"]);
                SH_DTO.JIDNH_WH_Number = Convert.ToInt64(row["DFS_JIDNH_WH_Number"]);
                SH_DTO.JIDNH_PaymentTerms = Convert.ToString(row["DFS_JIDNH_PaymentTerms"]);
                SH_DTO.JIDNH_DeliveryTerms = Convert.ToString(row["DFS_JIDNH_DeliveryTerms"]);
                SH_DTO.JIDNH_DeliveryMode = Convert.ToString(row["DFS_JIDNH_DeliveryMode"]);
                SH_DTO.JIDNH_DespatchDocumentNo = Convert.ToString(row["DFS_JIDNH_DespatchDocument"]);
                SH_DTO.JIDNH_DespatchedThrough = Convert.ToString(row["DFS_JIDNH_DespatchedThrough"]);
                SH_DTO.JIDNH_Remarks = Convert.ToString(row["DFS_JIDNH_Remarks"]);
            }

            ViewBag.Collapse = true;

            return View(SH_DTO);
        }

        [HttpPost]
        [Route("jobinward/transactions/delivery-note/save")]
        public IActionResult SaveDeliveryNote([FromBody] DeliveryNoteCreate_DTO dto)
        {
            try
            {
                DeliveryNoteHeader_DTO S_DTO = dto.Header;

                DeliveryNote_DTO SI_DTO = new DeliveryNote_DTO();
                DFS_JI_DeliveryNoteDAO SI_DAO = new DFS_JI_DeliveryNoteDAO();

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
            DFS_JI_DeliveryNoteDAO dao = new DFS_JI_DeliveryNoteDAO();

            DataSet ds = dao.JI_DeliveryNoteGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        dfS_JIDNH_Number = row["DFS_JIDNH_Number"],
                        dfS_JIDNH_MS_Number = row["DFS_JIDNH_MS_Number"],
                        dfS_JIDNH_JW_Customer_Number = row["DFS_JIDNH_JW_Customer_Number"],
                        cuS_Name = row["CUS_Name"],
                        dfS_JIDNH_Currency_Number = row["DFS_JIDNH_Currency_Number"],
                        currency_Name = row["Currency_Name"],
                        dfS_JIDNH_WH_Number = row["DFS_JIDNH_WH_Number"],
                        dfS_JIDNH_PaymentTerms = row["DFS_JIDNH_PaymentTerms"],
                        dfS_JIDNH_DeliveryTerms = row["DFS_JIDNH_DeliveryTerms"],
                        dfS_JIDNH_DeliveryMode = row["DFS_JIDNH_DeliveryMode"],
                        dfS_JIDNH_DespatchDocument = row["DFS_JIDNH_DespatchDocument"],
                        dfS_JIDNH_DespatchedThrough = row["DFS_JIDNH_DespatchedThrough"],
                        dfS_JIDNH_Remarks = row["DFS_JIDNH_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }

    }
}
