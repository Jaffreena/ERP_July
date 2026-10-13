using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobOutward
{
    public class JO_DFSServiceOrderController : Controller
    {
        Help Help = new Help();

        // MS dropdown: பழைய GetServiceOrderData() Tables[3]
        void GetServiceOrderData()
        {
            var SVO_DTO = new ERP_DTO.JobInwardTransaction.JI_ServiceOrder_DTO();
            var SVO_DAO = new ERP_DAO.JobInwardTransaction.ServiceOrder_DAO();

            SVO_DTO.Header.JISVOH_RegDate = DateTime.Now;
            SVO_DTO.Header.SVO_Id = 1;

            DataSet DS = SVO_DAO.ServiceOrderDB(SVO_DTO);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[3]);
        }

        public IActionResult JobworkInvoiceServiceOrderDFS()
        {
            var dto = new JobworkInvoiceServiceOrder_JO_DTO();

            GetServiceOrderData();

            DataSet ds = new JOJWI_SVO_DFS_DAO().JO_JobworkInvoiceServiceOrderGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                dto.JOJWI_SVOH_Number = Convert.ToInt64(row["JOJWI_SVO_DFS_Number"]);
                dto.JOJWI_SVOH_MS_Number = Convert.ToInt64(row["JOJWI_SVO_DFS_MS_Number"]);
                dto.JOJWI_SVOH_JW_Vendor_Number = Convert.ToInt64(row["JOJWI_SVO_DFS_JW_Vendor_Number"]);
                dto.JOJWI_SVOH_JW_Vendor_Name = Convert.ToString(row["JWV_JW_VendorName"]);
                dto.JOJWI_SVOH_PaymentTerms = Convert.ToString(row["JOJWI_SVO_DFS_PaymentTerms"]);
                dto.JOJWI_SVOH_DeliveryTerms = Convert.ToString(row["JOJWI_SVO_DFS_DeliveryTerms"]);
                dto.JOJWI_SVOH_DeliveryMode = Convert.ToString(row["JOJWI_SVO_DFS_DeliveryMode"]);
                dto.JOJWI_SVOH_Tax = Convert.ToString(row["JOJWI_SVO_DFS_Tax"]);
                dto.JOJWI_SVOH_TDC = Convert.ToString(row["JOJWI_SVO_DFS_TDC"]);
                dto.JOJWI_SVOH_Remarks = Convert.ToString(row["JOJWI_SVO_DFS_Remarks"]);
            }

            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JO_ServiceOrder/DFS/JOJWIServiceOrderDFS.cshtml", dto);
        }

        [HttpPost]
        [Route("jobout/transactions/jo-jobwork-invoice-service-order-dfs/save")]
        public IActionResult SaveJobworkInvoiceServiceOrderDFS([FromBody] JobworkInvoiceServiceOrder_JO_DTO dto)
        {
            try
            {
                new JOJWI_SVO_DFS_DAO().JO_JobworkInvoiceServiceOrderDB(dto);

                if (dto.Result_Number == 1)
                    return Json(new { success = true });

                return Json(new { success = false, message = dto.Result_Message });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("jobout/transactions/jo-jobwork-invoice-service-order-dfs/get")]
        public IActionResult GetJobworkInvoiceServiceOrderDFS()
        {
            DataSet ds = new JOJWI_SVO_DFS_DAO().JO_JobworkInvoiceServiceOrderGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];
                return Json(new
                {
                    success = true,
                    data = new
                    {
                        number = row["JOJWI_SVO_DFS_Number"],
                        msNumber = row["JOJWI_SVO_DFS_MS_Number"],
                        vendorNumber = row["JOJWI_SVO_DFS_JW_Vendor_Number"],
                        vendorName = row["JWV_JW_VendorName"],
                        paymentTerms = row["JOJWI_SVO_DFS_PaymentTerms"],
                        deliveryTerms = row["JOJWI_SVO_DFS_DeliveryTerms"],
                        deliveryMode = row["JOJWI_SVO_DFS_DeliveryMode"],
                        tax = row["JOJWI_SVO_DFS_Tax"],
                        tdc = row["JOJWI_SVO_DFS_TDC"],
                        remarks = row["JOJWI_SVO_DFS_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }

        // Vendor search: JO_ReceiptNote_SP (RN_Id = 5) reuse
        [HttpGet]
        [Route("jobout/transactions/jo-jobwork-invoice-service-order-dfs/vendor")]
        public IActionResult SearchVendor(string? Vendor)
        {
            var rn = new JO_ReceiptNoteCreate_DTO();
            rn.Header.RN_Id = 5;
            rn.Header.JORNH_RN_Date = DateTime.Now;
            rn.Header.JORNI_Item_Code = (Vendor ?? "").Trim();

            DataSet ds = new JO_ReceiptNote_DAO().JO_ReceiptNoteDB(rn);

            var list = ds.Tables[0].AsEnumerable().Select(r => new
            {
                vendorNumber = Convert.ToInt64(r["JWV_Number"]),
                vendorName = Convert.ToString(r["JWV_JW_VendorName"])
            }).ToList();

            return Json(list);
        }
    }
}