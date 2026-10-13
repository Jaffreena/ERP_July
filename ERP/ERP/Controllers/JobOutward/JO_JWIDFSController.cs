using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobOutward
{
    public class JO_JWIDFSController : Controller
    {
        Help Help = new Help();

        // MS dropdown: old GetServiceOrderData() Tables[3]
        void GetServiceOrderData()
        {
            var SVO_DTO = new ERP_DTO.JobInwardTransaction.JI_ServiceOrder_DTO();
            var SVO_DAO = new ERP_DAO.JobInwardTransaction.ServiceOrder_DAO();

            SVO_DTO.Header.JISVOH_RegDate = DateTime.Now;
            SVO_DTO.Header.SVO_Id = 1;

            DataSet DS = SVO_DAO.ServiceOrderDB(SVO_DTO);
            ViewBag.MaterialSegregation = Help.GetCat(DS.Tables[3]);
        }

        public IActionResult JobworkInvoiceDFS()
        {
            var dto = new JO_JobworkInvoiceDFS_DTO();

            GetServiceOrderData();

            DataSet ds = new JOSVI_DFS_DAO().JO_JobworkInvoiceDFSGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                dto.JOSVI_DFS_Number = Convert.ToInt64(row["JOSVI_DFS_Number"]);
                dto.JOSVI_DFS_MS_Number = Convert.ToInt64(row["JOSVI_DFS_MS_Number"]);
                dto.JOSVI_DFS_JW_Vendor_Number = Convert.ToInt64(row["JOSVI_DFS_JW_Vendor_Number"]);
                dto.JOSVI_DFS_JW_Vendor_Name = Convert.ToString(row["JWV_JW_VendorName"]);
                dto.JOSVI_DFS_PaymentTerms = Convert.ToString(row["JOSVI_DFS_PaymentTerms"]);
                dto.JOSVI_DFS_PaymentMethod = Convert.ToString(row["JOSVI_DFS_PaymentMethod"]);
                dto.JOSVI_DFS_Remarks = Convert.ToString(row["JOSVI_DFS_Remarks"]);
            }

            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JO_JobworkInvoice/DFS/JOJobworkInvoiceDFS.cshtml", dto);
        }

        [HttpPost]
        [Route("jobout/transactions/jo-jobwork-invoice-dfs/save")]
        public IActionResult SaveJobworkInvoiceDFS([FromBody] JO_JobworkInvoiceDFS_DTO dto)
        {
            try
            {
                new JOSVI_DFS_DAO().JO_JobworkInvoiceDFSDB(dto);

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
        [Route("jobout/transactions/jo-jobwork-invoice-dfs/get")]
        public IActionResult GetJobworkInvoiceDFS()
        {
            DataSet ds = new JOSVI_DFS_DAO().JO_JobworkInvoiceDFSGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];
                return Json(new
                {
                    success = true,
                    data = new
                    {
                        number = row["JOSVI_DFS_Number"],
                        mS_Number = row["JOSVI_DFS_MS_Number"],
                        vendorNumber = row["JOSVI_DFS_JW_Vendor_Number"],
                        vendorName = row["JWV_JW_VendorName"],
                        paymentTerms = row["JOSVI_DFS_PaymentTerms"],
                        paymentMethod = row["JOSVI_DFS_PaymentMethod"],
                        remarks = row["JOSVI_DFS_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }

        // Vendor search: JO_ReceiptNote_SP (RN_Id = 5) reuse
        [HttpGet]
        [Route("jobout/transactions/jo-jobwork-invoice-dfs/vendor")]
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
