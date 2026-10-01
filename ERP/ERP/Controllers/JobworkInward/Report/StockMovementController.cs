using ERP.Models;
using ERP_DAO.JobInwardTransaction;
using ERP_DTO.JobInwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;

namespace ERP.Controllers.JobworkInward.Report
{
    public class StockMovementController : Controller
    {
        StockMovement_DAO SM_DAO = new StockMovement_DAO();
        Help Help = new Help();
        [HttpGet]
        public IActionResult Index()
        {
            ViewBag.ItemGroup = Help.GetCat(SM_DAO.GetItemGroupList().Tables[0]);   // reuses existing dropdown-loader pattern
            ViewBag.Warehouse = Help.GetCat(SM_DAO.GetWarehouseList().Tables[0]);
            ViewBag.Item = Help.GetCat(SM_DAO.GetItemList().Tables[0]);
            ViewBag.Collapse = true;
            return View(new StockMovementReport_DTO());
        }

        [HttpGet]
        public JsonResult GetStockMovementData(DateTime? FromDate, DateTime? ToDate,
            long? ItemGroupNumber, long? WarehouseNumber, long? ItemNumber)
        {
            var filter = new StockMovementFilter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                ItemGroupNumber = ItemGroupNumber,
                WarehouseNumber = WarehouseNumber,
                ItemNumber = ItemNumber
            };

            DataTable dt = SM_DAO.GetStockMovementDB(filter).Tables[0];

            var rows = dt.AsEnumerable().Select(r => new
            {
                ItemGroupName = r["ItemGroupName"] == DBNull.Value ? "" : r["ItemGroupName"].ToString(),
                ItemNumber = r["ItemNumber"] == DBNull.Value ? "" : r["ItemNumber"].ToString(),
                Description = r["Description"] == DBNull.Value ? "" : r["Description"].ToString(),
                OuterDia = r["OuterDia"] == DBNull.Value ? "" : r["OuterDia"].ToString(),
                Thickness = r["Thickness"] == DBNull.Value ? "" : r["Thickness"].ToString(),
                Length = r["Length"] == DBNull.Value ? "" : r["Length"].ToString(),
                MaterialGrade = r["MaterialGrade"] == DBNull.Value ? "" : r["MaterialGrade"].ToString(),
                OpeningQty = r["OpeningQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["OpeningQty"]),
                InwardQty = r["InwardQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["InwardQty"]),
                OutwardQty = r["OutwardQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["OutwardQty"]),
                ClosingQty = r["ClosingQty"] == DBNull.Value ? 0 : Convert.ToDecimal(r["ClosingQty"])
            }).ToList();

            return new JsonResult(rows, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }
    }
}
