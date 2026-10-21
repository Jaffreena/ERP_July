using ERP_DAO.JobOutwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Linq;
using System.Text.Json;

namespace ERP.Controllers.JobworkOutward
{
    public class JOFreightSOPendingDNRegisterController : Controller
    {
        #region Page

        [Route("jo/reports/freight-so-pending-dn-register")]
        public IActionResult Index()
        {
            ViewBag.Collapse = true;
            return View("~/Views/JobworkOutward/JOFreightSOPendingDNRegister/Index.cshtml");
        }

        #endregion

        #region Get Data

        [HttpGet]
        [Route("jo/reports/freight-so-pending-dn-register/get")]
        public JsonResult GetJOFreightSOPendingDNRegister(
            DateTime? FromDate,
            DateTime? ToDate,
            string SO_No,
            long? JW_Vendor_Number,
            long? JPRS_Number,
            long? FromWH_Number,
            long? ToWH_Number)
        {
            JOFreightSOPendingDNRegister_Filter_DTO filter = new JOFreightSOPendingDNRegister_Filter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                SO_No = SO_No,
                JW_Vendor_Number = JW_Vendor_Number,
                JPRS_Number = JPRS_Number,
                FromWH_Number = FromWH_Number,
                ToWH_Number = ToWH_Number
            };

            JOFreightSOPendingDNRegister_DAO dao = new JOFreightSOPendingDNRegister_DAO();
            DataTable dt = dao.JOFreightSOPendingDNRegisterDB(filter).Tables[0];

            string Str(DataRow r, string c) => r[c] == DBNull.Value ? "" : r[c].ToString();
            long Lng(DataRow r, string c) => r[c] == DBNull.Value ? 0 : Convert.ToInt64(r[c]);
            decimal Dec(DataRow r, string c) => r[c] == DBNull.Value ? 0 : Convert.ToDecimal(r[c]);
            string Dt(DataRow r, string c) => r[c] == DBNull.Value ? "" : Convert.ToDateTime(r[c]).ToString("dd MMM yyyy");

            // explicit lowercase-starting names (no naming policy)
            var data = dt.AsEnumerable().Select(r => new
            {
                svoNumber = Lng(r, "SVONumber"),
                svoNo = Str(r, "SVONo"),
                svoDate = Dt(r, "SVODate"),

                jwVendorNumber = Lng(r, "VendorNumber"),
                jwVendorName = Str(r, "JWVendorName"),

                svoItemNumber = Lng(r, "SVOItemNumber"),
                processNumber = Lng(r, "ProcessNumber"),
                processName = Str(r, "ProcessName"),

                fromWHNumber = Lng(r, "FromWHNumber"),
                fromWH = Str(r, "FromWH"),
                toWHNumber = Lng(r, "ToWHNumber"),
                toWH = Str(r, "ToWH"),

                uom = Str(r, "UOM"),

                orderedQty = Dec(r, "OrderedQty"),
                dnAssignedQty = Dec(r, "DNAssignedQty"),
                directlyInvoicedQty = Dec(r, "DirectlyInvoicedQty"),
                pendingQty = Dec(r, "PendingQty")
            }).ToList();

            return new JsonResult(data, new JsonSerializerOptions { WriteIndented = true });
        }

        #endregion
    }
}