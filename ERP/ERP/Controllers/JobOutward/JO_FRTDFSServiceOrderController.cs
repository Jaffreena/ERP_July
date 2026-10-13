using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace ERP.Controllers.JobOutward
{
    public class JO_FRTDFSServiceOrderController : Controller
    {
        Help Help = new Help();

        // Category dropdown: old GetServiceOrderData() Tables[3]
        void GetServiceOrderData()
        {
            var SVO_DTO = new ERP_DTO.JobInwardTransaction.JI_ServiceOrder_DTO();
            var SVO_DAO = new ERP_DAO.JobInwardTransaction.ServiceOrder_DAO();

            SVO_DTO.Header.JISVOH_RegDate = DateTime.Now;
            SVO_DTO.Header.SVO_Id = 1;

            DataSet DS = SVO_DAO.ServiceOrderDB(SVO_DTO);
            // Category is stored as text (nvarchar), so Value = Text
            var cat = Help.GetCat(DS.Tables[3]);
            foreach (var i in cat) i.Value = i.Text;
            ViewBag.Category = cat;
        }

        public IActionResult FreightServiceOrderDFS()
        {
            var dto = new FreightServiceOrder_JO_DTO();

            GetServiceOrderData();

            DataSet ds = new JOFRT_SVO_DFS_DAO().JO_FreightServiceOrderGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                DataRow row = ds.Tables[0].Rows[0];

                dto.JOFRT_SVOH_Number = Convert.ToInt64(row["JOFRT_SVO_DFS_Number"]);
                dto.JOFRT_SVOH_Category = Convert.ToString(row["JOFRT_SVO_DFS_Category"]);
                dto.JOFRT_SVOH_JW_Vendor_Number = Convert.ToInt64(row["JOFRT_SVO_DFS_JW_Vendor_Number"]);
                dto.JOFRT_SVOH_JW_Vendor_Name = Convert.ToString(row["JWV_JW_VendorName"]);
                dto.JOFRT_SVOH_PaymentTerms = Convert.ToString(row["JOFRT_SVO_DFS_PaymentTerms"]);
                dto.JOFRT_SVOH_DeliveryTerms = Convert.ToString(row["JOFRT_SVO_DFS_DeliveryTerms"]);
                dto.JOFRT_SVOH_DeliveryMode = Convert.ToString(row["JOFRT_SVO_DFS_DeliveryMode"]);
                dto.JOFRT_SVOH_Tax = Convert.ToString(row["JOFRT_SVO_DFS_Tax"]);
                dto.JOFRT_SVOH_TDC = Convert.ToString(row["JOFRT_SVO_DFS_TDC"]);
                dto.JOFRT_SVOH_Remarks = Convert.ToString(row["JOFRT_SVO_DFS_Remarks"]);
            }

            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JO_ServiceOrder/DFS/JOFRTServiceOrderDFS.cshtml", dto);
        }

        [HttpPost]
        [Route("jobout/transactions/jo-freight-service-order-dfs/save")]
        public IActionResult SaveFreightServiceOrderDFS([FromBody] FreightServiceOrder_JO_DTO dto)
        {
            try
            {
                new JOFRT_SVO_DFS_DAO().JO_FreightServiceOrderDB(dto);

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
        [Route("jobout/transactions/jo-freight-service-order-dfs/get")]
        public IActionResult GetFreightServiceOrderDFS()
        {
            DataSet ds = new JOFRT_SVO_DFS_DAO().JO_FreightServiceOrderGet();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                var row = ds.Tables[0].Rows[0];
                return Json(new
                {
                    success = true,
                    data = new
                    {
                        number = row["JOFRT_SVO_DFS_Number"],
                        category = row["JOFRT_SVO_DFS_Category"],
                        vendorNumber = row["JOFRT_SVO_DFS_JW_Vendor_Number"],
                        vendorName = row["JWV_JW_VendorName"],
                        paymentTerms = row["JOFRT_SVO_DFS_PaymentTerms"],
                        deliveryTerms = row["JOFRT_SVO_DFS_DeliveryTerms"],
                        deliveryMode = row["JOFRT_SVO_DFS_DeliveryMode"],
                        tax = row["JOFRT_SVO_DFS_Tax"],
                        tdc = row["JOFRT_SVO_DFS_TDC"],
                        remarks = row["JOFRT_SVO_DFS_Remarks"]
                    }
                });
            }

            return Json(new { success = false });
        }

        // Vendor search: JO_ReceiptNote_SP (RN_Id = 5) reuse
        [HttpGet]
        [Route("jobout/transactions/jo-freight-service-order-dfs/vendor")]
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
