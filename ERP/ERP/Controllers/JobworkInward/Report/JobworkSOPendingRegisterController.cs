using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Linq;

namespace ERP.Controllers.JobworkInward.Reports
{
    public class JobworkSOPendingRegisterController : Controller
    {
        JobworkSOPendingRegister_DAO dao = new JobworkSOPendingRegister_DAO();

        [Route("jobworkinvoice/reports/jobwork-so-pending-register")]
        public IActionResult Index()
        {
            ViewBag.Collapse = true;
            return View("~/Views/JobworkInward/Reports/JobworkSOPendingRegister/Index.cshtml");
        }

        [Route("jobworkinvoice/reports/jobwork-so-pending-register/get")]
        public IActionResult GetJobworkSOPendingRegister(
            DateTime? FromDate, DateTime? ToDate, string SO_No,
            long? JW_Customer_Number, long? PRS_Number,
            long? ItemGroup_Number, long? Item_Number)
        {
            var filter = new JobworkSOPendingRegister_Filter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                SO_No = SO_No,
                JW_Customer_Number = JW_Customer_Number,
                PRS_Number = PRS_Number,
                ItemGroup_Number = ItemGroup_Number,
                Item_Number = Item_Number
            };

            DataSet ds = dao.JobworkSOPendingRegisterDB(filter);

            var result = ds.Tables[0].AsEnumerable().Select(r => new
            {
                svoNumber = r["SVONumber"],
                regNo = r["RegNo"] == DBNull.Value ? "" : r["RegNo"].ToString(),
                regDate = r["RegDate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(r["RegDate"]),
                svoNo = r["SVONo"] == DBNull.Value ? "" : r["SVONo"].ToString(),
                svoDate = r["SVODate"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(r["SVODate"]),
                customerNumber = r["CustomerNumber"],
                jwCustomerName = r["JWCustomerName"] == DBNull.Value ? "" : r["JWCustomerName"].ToString(),
                svoItemNumber = r["SVOItemNumber"],
                processNumber = r["ProcessNumber"],
                processName = r["ProcessName"] == DBNull.Value ? "" : r["ProcessName"].ToString(),
                itemGroupNumber = r["ItemGroupNumber"],
                itemGroupName = r["ItemGroupName"] == DBNull.Value ? "" : r["ItemGroupName"].ToString(),
                itemNumber = r["ItemNumber"],
                itemCode = r["ItemCode"] == DBNull.Value ? "" : r["ItemCode"].ToString(),
                itemDescription = r["ItemDescription"] == DBNull.Value ? "" : r["ItemDescription"].ToString(),
                outerDia = r["OuterDia"] == DBNull.Value ? "" : r["OuterDia"].ToString(),
                thickness = r["Thickness"] == DBNull.Value ? "" : r["Thickness"].ToString(),
                length = r["Length"] == DBNull.Value ? "" : r["Length"].ToString(),
                materialGrade = r["MaterialGrade"] == DBNull.Value ? "" : r["MaterialGrade"].ToString(),
                uom = r["UOM"] == DBNull.Value ? "" : r["UOM"].ToString(),
                orderedQty = r["OrderedQty"],
                dnAssignedQty = r["DNAssignedQty"],
                directlyInvoicedQty = r["DirectlyInvoicedQty"],
                pendingQty = r["PendingQty"]
            }).ToList();

            return Json(result);
        }
    }
}