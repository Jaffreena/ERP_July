using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DL;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobworkInward
{
    public class DefaultFormSettingController : Controller
    {
        ReceiptNote_DTO SI_DTO = new ReceiptNote_DTO();
        ReceiptNote_DAO SI_DAO = new ReceiptNote_DAO();
        ReceiptNote_DL S_DL = new ReceiptNote_DL();
        Validation Valid = new Validation();
        Help Help = new Help();
        DataSet DS = new DataSet();
        public IActionResult ReceiptNoteDefaultSetting()
        {
            ReceiptNoteHead_DTO SH_DTO = new ReceiptNoteHead_DTO();

            if (TempData["SH_DTO_Json"] is string SHto)
            {
                SH_DTO = System.Text.Json.JsonSerializer.Deserialize<ReceiptNoteHead_DTO>(SHto);
            }

            JIRN_DFS_DAO dao = new JIRN_DFS_DAO();
            DataSet ds = dao.JI_ReceiptNoteGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];
                SH_DTO.JIRNH_Number = Convert.ToInt64(row["JIRN_DFS_Number"]);
                SH_DTO.JIRNH_JW_CustomerDC_No = Convert.ToString(row["JIRN_DFS_JW_CustomerDC_No"]);
                SH_DTO.JIRNH_MS_Number = Convert.ToString(row["JIRN_DFS_MS_Number"]);
                SH_DTO.JIRNH_JWC_Number = Convert.ToString(row["JIRN_DFS_JWC_Number"]);
                SH_DTO.JWC_Name = Convert.ToString(row["CUS_Name"]);

                SH_DTO.JIRNH_Currency_Number = Convert.ToString(row["JIRN_DFS_Currency_Number"]);
                SH_DTO.Currency_Name = Convert.ToString(row["Currency_Name"]);
                SH_DTO.JIRNH_WH_Number = Convert.ToString(row["JIRN_DFS_WH_Number"]);
                SH_DTO.JIRNH_Remarks = Convert.ToString(row["JIRN_DFS_Remarks"]);
            }

            SH_DTO.JIRNH_JW_CustomerDC_Date = DateTime.Now.ToString("dd-MMM-yy");

            ReceiptGetData();

            ViewBag.Collapse = true;

            return View(SH_DTO);
        }
        void ReceiptGetData()
        {
            SI_DTO.JIRNH_RN_Date = DateTime.Now;
            SI_DTO.JIRN_Id = 1;
            SI_DTO.JIRN_CreatorCode = Convert.ToInt64(1);
            DS = SI_DAO.JI_ReceiptNoteDB(SI_DTO);


            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[0]);
            ViewBag.UoM = Help.GetCat(DS.Tables[1]);

            ViewBag.Warehouse = Help.GetCat(DS.Tables[2]);
            ViewBag.PRS = Help.GetCat(DS.Tables[3]);

        }
        [HttpPost]
        [Route("jobinward/transactions/receipt-note/save")]
        public IActionResult Save([FromBody] ReceiptNoteCreate_DTO dto)
        {
            try
            {
                ReceiptNoteHead_DTO S_DTO = dto.Header;

                ReceiptNote_DTO SI_DTO = new ReceiptNote_DTO();
                JIRN_DFS_DAO SI_DAO = new JIRN_DFS_DAO();

                SI_DTO.JIRNH_JW_CustomerDC_No = Convert.ToString(S_DTO.JIRNH_JW_CustomerDC_No);
                SI_DTO.JIRNH_MS_Number = long.TryParse(S_DTO.JIRNH_MS_Number, out var ms) ? ms : 0;
                SI_DTO.JIRNH_JWC_Number = long.TryParse(S_DTO.JIRNH_JWC_Number, out var jwc) ? jwc : 0;
                SI_DTO.JIRNH_Currency_Number = long.TryParse(S_DTO.JIRNH_Currency_Number, out var cur) ? cur : 0;
                SI_DTO.JIRNH_WH_Number = long.TryParse(S_DTO.JIRNH_WH_Number, out var wh) ? wh : 0;
                SI_DTO.JIRNH_Remarks = Convert.ToString(S_DTO.JIRNH_Remarks);

                // Save
                SI_DAO.JI_ReceiptNoteDB(SI_DTO);

                if (SI_DTO.Result_Number == 1)
                {
                    return Json(new
                    {
                        success = true
                    });
                }

                return Json(new
                {
                    success = false,
                    message = SI_DTO.Result_Message
                });
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        [HttpGet]
        [Route("~/jobinward/transactions/receipt-note/getinfo")]
        public IActionResult Get()
        {
            JIRN_DFS_DAO dao = new JIRN_DFS_DAO();

            DataSet ds = dao.JI_ReceiptNoteGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        dfS_JIRNH_Number = row["JIRN_DFS_Number"],
                        dfS_JIRNH_JW_CustomerDC_No = row["JIRN_DFS_JW_CustomerDC_No"],
                        dfS_JIRNH_MS_Number = row["JIRN_DFS_MS_Number"],
                        dfS_JIRNH_JWC_Number = row["JIRN_DFS_JWC_Number"],
                        cuS_Name = row["CUS_Name"],
                        dfS_JIRNH_Currency_Number = row["JIRN_DFS_Currency_Number"],
                        currency_Name = row["Currency_Name"],
                        dfS_JIRNH_WH_Number = row["JIRN_DFS_WH_Number"],
                        dfS_JIRNH_Remarks = row["JIRN_DFS_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }

    }
}