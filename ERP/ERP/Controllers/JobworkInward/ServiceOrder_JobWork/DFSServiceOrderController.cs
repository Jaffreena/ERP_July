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

        public IActionResult FreightServiceOrderDefaultSetting()
        {
            FreightServiceOrder_DTO FS_DTO = new FreightServiceOrder_DTO();

            GetServiceOrderData();

            JIFRT_SVO_DFS_DAO dao = new JIFRT_SVO_DFS_DAO();
            DataSet ds = dao.JI_FreightServiceOrderGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                FS_DTO.JIFRT_SVOH_ServiceOrderNo = Convert.ToString(row["JIFRT_SVOH_DFS_ServiceOrderNo"]);
                FS_DTO.JIFRT_SVOH_JW_Customer_Number = Convert.ToInt64(row["JIFRT_SVOH_DFS_JW_Customer_Number"]);
                FS_DTO.JIFRT_SVOH_Currency_Number = Convert.ToInt64(row["JIFRT_SVOH_DFS_Currency_Number"]);
                FS_DTO.JIFRT_SVOH_PaymentTerms = Convert.ToString(row["JIFRT_SVOH_DFS_PaymentTerms"]);
                FS_DTO.JIFRT_SVOH_DeliveryTerms = Convert.ToString(row["JIFRT_SVOH_DFS_DeliveryTerms"]);
                FS_DTO.JIFRT_SVOH_DeliveryMode = Convert.ToString(row["JIFRT_SVOH_DFS_DeliveryMode"]);
                FS_DTO.JIFRT_SVOH_Tax = Convert.ToString(row["JIFRT_SVOH_DFS_Tax"]);
                FS_DTO.JIFRT_SVOH_TDC = Convert.ToString(row["JIFRT_SVOH_DFS_TDC"]);
                FS_DTO.JIFRT_SVOH_Remarks = Convert.ToString(row["JIFRT_SVOH_DFS_Remarks"]);
                FS_DTO.JIFRT_SVOH_MS_Number = Convert.ToInt64(row["JIFRT_SVOH_DFS_MS_Number"]);
                FS_DTO.JIFRT_SVOH_JW_Customer_Name = Convert.ToString(row["CUS_Name"]);
            }

            ViewBag.Collapse = true;

            return View("~/Views/JobworkInward/ServiceOrder_Freight/JIFRTServiceOrderDefaultSettings.cshtml", FS_DTO);
        }

        public IActionResult JobworkInvoiceServiceOrderDefaultSetting()
        {
            JobworkInvoiceServiceOrder_DTO JW_DTO = new JobworkInvoiceServiceOrder_DTO();

            GetServiceOrderData();

            JIJWI_SVO_DFS_DAO dao = new JIJWI_SVO_DFS_DAO();
            DataSet ds = dao.JI_JobworkInvoiceServiceOrderGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                JW_DTO.JIJWI_SVOH_Number = Convert.ToInt64(row["JIJWI_SVOH_DFS_Number"]);
                JW_DTO.JIJWI_SVOH_ServiceOrderNo = Convert.ToString(row["JIJWI_SVOH_DFS_ServiceOrderNo"]);
                JW_DTO.JIJWI_SVOH_JW_Customer_Number = Convert.ToInt64(row["JIJWI_SVOH_DFS_JW_Customer_Number"]);
                JW_DTO.JIJWI_SVOH_JW_Customer_Name = Convert.ToString(row["CUS_Name"]);
                JW_DTO.JIJWI_SVOH_Currency_Number = Convert.ToInt64(row["JIJWI_SVOH_DFS_Currency_Number"]);
                JW_DTO.JIJWI_SVOH_PaymentTerms = Convert.ToString(row["JIJWI_SVOH_DFS_PaymentTerms"]);
                JW_DTO.JIJWI_SVOH_DeliveryTerms = Convert.ToString(row["JIJWI_SVOH_DFS_DeliveryTerms"]);
                JW_DTO.JIJWI_SVOH_DeliveryMode = Convert.ToString(row["JIJWI_SVOH_DFS_DeliveryMode"]);
                JW_DTO.JIJWI_SVOH_Tax = Convert.ToString(row["JIJWI_SVOH_DFS_Tax"]);
                JW_DTO.JIJWI_SVOH_TDC = Convert.ToString(row["JIJWI_SVOH_DFS_TDC"]);
                JW_DTO.JIJWI_SVOH_Remarks = Convert.ToString(row["JIJWI_SVOH_DFS_Remarks"]);
                JW_DTO.JIJWI_SVOH_MS_Number = Convert.ToInt64(row["JIJWI_SVOH_DFS_MS_Number"]);
            }

            ViewBag.Collapse = true;

            return View("~/Views/JobworkInward/ServiceOrder_JobWork/JIJWIServiceOrderDefaultSettings.cshtml", JW_DTO);
        }

        [HttpPost]
        [Route("jobinward/transactions/freight-service-order/save")]
        public IActionResult SaveFreightServiceOrder([FromBody] FreightServiceOrder_DTO FS_DTO)
        {
            try
            {
                JIFRT_SVO_DFS_DAO FS_DAO = new JIFRT_SVO_DFS_DAO();

                FS_DAO.JI_FreightServiceOrderDB(FS_DTO);

                if (FS_DTO.Result_Number == 1)
                {
                    return Json(new { success = true });
                }

                return Json(new { success = false, message = FS_DTO.Result_Message });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }


        [HttpGet]
        [Route("jobinward/transactions/freight-service-order/get")]
        public IActionResult GetFreightServiceOrder()
        {
            JIFRT_SVO_DFS_DAO dao = new JIFRT_SVO_DFS_DAO();

            DataSet ds = dao.JI_FreightServiceOrderGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        dfS_JIFRT_SVOH_Number = row["JIFRT_SVOH_DFS_Number"],
                        dfS_JIFRT_SVOH_ServiceOrderNo = row["JIFRT_SVOH_DFS_ServiceOrderNo"],
                        dfS_JIFRT_SVOH_JW_Customer_Number = row["JIFRT_SVOH_DFS_JW_Customer_Number"],
                        cuS_Name = row["CUS_Name"],
                        dfS_JIFRT_SVOH_Currency_Number = row["JIFRT_SVOH_DFS_Currency_Number"],
                        currency_Name = row["Currency_Name"],
                        dfS_JIFRT_SVOH_PaymentTerms = row["JIFRT_SVOH_DFS_PaymentTerms"],
                        dfS_JIFRT_SVOH_DeliveryTerms = row["JIFRT_SVOH_DFS_DeliveryTerms"],
                        dfS_JIFRT_SVOH_DeliveryMode = row["JIFRT_SVOH_DFS_DeliveryMode"],
                        dfS_JIFRT_SVOH_Tax = row["JIFRT_SVOH_DFS_Tax"],
                        dfS_JIFRT_SVOH_TDC = row["JIFRT_SVOH_DFS_TDC"],
                        dfS_JIFRT_SVOH_MS_Number = row["JIFRT_SVOH_DFS_MS_Number"],
                        dfS_JIFRT_SVOH_Remarks = row["JIFRT_SVOH_DFS_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }

        [HttpPost]
        [Route("jobinward/transactions/jobwork-invoice-service-order/save")]
        public IActionResult SaveJobworkInvoiceServiceOrder([FromBody] JobworkInvoiceServiceOrder_DTO JW_DTO)
        {
            try
            {
                JIJWI_SVO_DFS_DAO JW_DAO = new JIJWI_SVO_DFS_DAO();

                JW_DAO.JI_JobworkInvoiceServiceOrderDB(JW_DTO);

                if (JW_DTO.Result_Number == 1)
                {
                    return Json(new { success = true });
                }

                return Json(new { success = false, message = JW_DTO.Result_Message });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("jobinward/transactions/jobwork-invoice-service-order/get")]
        public IActionResult GetJobworkInvoiceServiceOrder()
        {
            JIJWI_SVO_DFS_DAO dao = new JIJWI_SVO_DFS_DAO();

            DataSet ds = dao.JI_JobworkInvoiceServiceOrderGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        dfS_JIJWI_SVOH_Number = row["DFS_JIJWI_SVOH_Number"],
                        dfS_JIJWI_SVOH_ServiceOrderNo = row["DFS_JIJWI_SVOH_ServiceOrderNo"],
                        dfS_JIJWI_SVOH_JW_Customer_Number = row["DFS_JIJWI_SVOH_JW_Customer_Number"],
                        cuS_Name = row["CUS_Name"],
                        dfS_JIJWI_SVOH_Currency_Number = row["DFS_JIJWI_SVOH_Currency_Number"],
                        currency_Name = row["Currency_Name"],
                        dfS_JIJWI_SVOH_PaymentTerms = row["DFS_JIJWI_SVOH_PaymentTerms"],
                        dfS_JIJWI_SVOH_DeliveryTerms = row["DFS_JIJWI_SVOH_DeliveryTerms"],
                        dfS_JIJWI_SVOH_DeliveryMode = row["DFS_JIJWI_SVOH_DeliveryMode"],
                        dfS_JIJWI_SVOH_Tax = row["DFS_JIJWI_SVOH_Tax"],
                        dfS_JIJWI_SVOH_TDC = row["DFS_JIJWI_SVOH_TDC"],
                        dfS_JIJWI_SVOH_MS_Number = row["DFS_JIJWI_SVOH_MS_Number"],
                        dfS_JIJWI_SVOH_Remarks = row["DFS_JIJWI_SVOH_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }

    }

}
