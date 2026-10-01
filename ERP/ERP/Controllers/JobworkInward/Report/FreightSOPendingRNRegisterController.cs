using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Linq;

namespace ERP.Controllers.JobworkInward.Reports
{
    public class FreightSOPendingRNRegisterController : Controller
    {
        FreightSOPendingRegister_DAO DAO = new FreightSOPendingRegister_DAO();

        [Route("jobworkinvoice/reports/freight-so-pending-rn-register")]
        public IActionResult Index()
        {
            return View("~/Views/JobworkInward/Reports/FreightSOPendingRNRegister/Index.cshtml");
        }

        [HttpGet]
        [Route("jobworkinvoice/reports/freight-so-pending-rn-register/get")]
        public JsonResult GetFreightSOPendingRNRegister(
            DateTime? FromDate, DateTime? ToDate, string? SO_No,
            long? JW_Customer_Number, long? PRS_Number,
            long? FromWH_Number, long? ToWH_Number)
        {
            var filter = new FreightSOPendingRegister_Filter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                SO_No = SO_No,
                JW_Customer_Number = JW_Customer_Number,
                PRS_Number = PRS_Number,
                FromWH_Number = FromWH_Number,
                ToWH_Number = ToWH_Number
            };

            DataTable dt = DAO.FreightSOPendingRNRegisterDB(filter).Tables[0];

            var data = dt.AsEnumerable().Select(r => new
            {
                svoNumber = r["JIFRT_SVOH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIFRT_SVOH_Number"]),
                regNo = r["JIFRT_SVOH_RegNo"] == DBNull.Value ? "" : r["JIFRT_SVOH_RegNo"].ToString(),
                regDate = r["JIFRT_SVOH_RegDate"] == DBNull.Value ? "" : Convert.ToDateTime(r["JIFRT_SVOH_RegDate"]).ToString("dd MMM yyyy"),
                svoNo = r["JIFRT_SVOH_ServiceOrderNo"] == DBNull.Value ? "" : r["JIFRT_SVOH_ServiceOrderNo"].ToString(),
                svoDate = r["JIFRT_SVOH_ServiceOrderDate"] == DBNull.Value ? "" : Convert.ToDateTime(r["JIFRT_SVOH_ServiceOrderDate"]).ToString("dd MMM yyyy"),
                customerNumber = r["JIFRT_SVOH_JW_Customer_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIFRT_SVOH_JW_Customer_Number"]),
                jwCustomerName = r["JW_Customer_Name"] == DBNull.Value ? "" : r["JW_Customer_Name"].ToString(),
                svoItemNumber = r["JIFRT_SVOI_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIFRT_SVOI_Number"]),
                processNumber = r["JIFRT_SVOI_PRS_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIFRT_SVOI_PRS_Number"]),
                processName = r["PRS_ProcessName"] == DBNull.Value ? "" : r["PRS_ProcessName"].ToString(),
                fromWHNumber = r["JIFRT_SVOI_FromWH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIFRT_SVOI_FromWH_Number"]),
                fromWH = r["FromWH_Name"] == DBNull.Value ? "" : r["FromWH_Name"].ToString(),
                toWHNumber = r["JIFRT_SVOI_ToWH_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIFRT_SVOI_ToWH_Number"]),
                toWH = r["ToWH_Name"] == DBNull.Value ? "" : r["ToWH_Name"].ToString(),
                uomNumber = r["JIFRT_SVOI_UoM_Number"] == DBNull.Value ? 0 : Convert.ToInt64(r["JIFRT_SVOI_UoM_Number"]),
                uom = r["UoM_Name"] == DBNull.Value ? "" : r["UoM_Name"].ToString(),
                orderedQty = r["OrderedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["OrderedQty"]),
                rnAssignedQty = r["RNAssignedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["RNAssignedQty"]),
                directlyInvoicedQty = r["DirectlyInvoicedQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["DirectlyInvoicedQty"]),
                pendingQty = r["PendingQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["PendingQty"])
            }).ToList();

            return new JsonResult(data);
        }
    }
}