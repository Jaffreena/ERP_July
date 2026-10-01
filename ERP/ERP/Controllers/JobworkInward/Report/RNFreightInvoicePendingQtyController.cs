using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Linq;

namespace ERP.Controllers.JobworkInward.Reports
{
    public class RNFreightInvoicePendingQtyController : Controller
    {
        RNFreightInvoicePendingQty_DAO dao = new RNFreightInvoicePendingQty_DAO();

        [Route("jobworkinvoice/reports/rn-freight-pending-qty")]
        public IActionResult Index()
        {
            ViewBag.Collapse = true;
            return View("~/Views/JobworkInward/Reports/RNFreightInvoicePendingQty/Index.cshtml");
        }

        [Route("jobworkinvoice/reports/rn-freight-pending-qty/get")]
        public IActionResult GetRNFreightInvoicePendingQty(
            DateTime? FromDate, DateTime? ToDate, string RN_No,
            string JWC_DN_No, string Freight_SO_No, long? JW_Customer_Number)
        {
            var filter = new RNFreightInvoicePendingQty_Filter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                RN_No = RN_No,
                JWC_DN_No = JWC_DN_No,
                Freight_SO_No = Freight_SO_No,
                JW_Customer_Number = JW_Customer_Number
            };

            DataSet ds = dao.RNFreightInvoicePendingQtyDB(filter);

            var result = ds.Tables[0].AsEnumerable().Select(r => new
            {
                rnNumber = r["RNNumber"],
                rnNo = r["RNNo"].ToString(),
                rnDate = r["RNDate"],
                jwcdnNo = r["JWCDNNo"] == DBNull.Value ? "" : r["JWCDNNo"].ToString(),
                jwcdnDate = r["JWCDNDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(r["JWCDNDate"]),
                freightSONumber = r["FreightSONumber"],
                freightSONo = r["FreightSONo"] == DBNull.Value ? "" : r["FreightSONo"].ToString(),
                freightSODate = r["FreightSODate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(r["FreightSODate"]),
                customerNumber = r["CustomerNumber"],
                jwCustomerName = r["JWCustomerName"] == DBNull.Value ? "" : r["JWCustomerName"].ToString(),
                fromWHNumber = r["FromWHNumber"],
                fromWH = r["FromWH"] == DBNull.Value ? "" : r["FromWH"].ToString(),
                toWHNumber = r["ToWHNumber"],
                toWH = r["ToWH"] == DBNull.Value ? "" : r["ToWH"].ToString(),
                receivedQty = r["ReceivedQty"],
                invoicedQty = r["InvoicedQty"],
                pendingQty = r["PendingQty"]
            }).ToList();

            return Json(result);
        }
    }
}