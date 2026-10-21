using ERP.Models;
using ERP_DAO.JobOutwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;

namespace ERP.Controllers.JobworkOutward.Report
{
    public class JOStockMovementController : Controller
    {
        JOStockMovement_DAO SM_DAO = new JOStockMovement_DAO();
        Help Help = new Help();

        [HttpGet]
        public IActionResult Index()
        {
            ViewBag.ItemGroup = Help.GetCat(SM_DAO.GetItemGroupList().Tables[0]);
            ViewBag.Warehouse = Help.GetCat(SM_DAO.GetWarehouseList().Tables[0]);
            ViewBag.Item = Help.GetCat(SM_DAO.GetItemList().Tables[0]);
            ViewBag.Collapse = true;
            return View(new JOStockMovementReport_DTO());
        }

        [HttpGet]
        public JsonResult GetStockMovementData(DateTime? FromDate, DateTime? ToDate,
            long? ItemGroupNumber, long? WarehouseNumber, long? ItemNumber)
        {
            var filter = new JOStockMovementFilter_DTO
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

    public class JOStockMovementDetailController : Controller
    {
        JOStockMovement_DAO SM_DAO = new JOStockMovement_DAO();
        Help Help = new Help();

        [HttpGet]
        public IActionResult Index()
        {
            ViewBag.ItemGroup = Help.GetCat(SM_DAO.GetItemGroupList().Tables[0]);
            ViewBag.Warehouse = Help.GetCat(SM_DAO.GetWarehouseList().Tables[0]);
            ViewBag.Item = Help.GetCat(SM_DAO.GetItemList().Tables[0]);
            ViewBag.Collapse = true;
            return View(new JOStockMovementReport_DTO());
        }

        [HttpGet]
        public JsonResult GetStockMovementDetailData(DateTime? FromDate, DateTime? ToDate,
            long? ItemGroupNumber, long? WarehouseNumber, long? ItemNumber)
        {
            var filter = new JOStockMovementFilter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                ItemGroupNumber = ItemGroupNumber,
                WarehouseNumber = WarehouseNumber,
                ItemNumber = ItemNumber
            };

            DataTable dt = SM_DAO.GetStockMovementDetailDB(filter).Tables[0];

            string Str(DataRow r, string c) => r[c] == DBNull.Value ? "" : r[c].ToString();
            decimal Dec(DataRow r, string c) => r[c] == DBNull.Value ? 0 : Convert.ToDecimal(r[c]);

            var rows = dt.AsEnumerable().Select(r => new
            {
                ItemGroupName = Str(r, "ItemGroupName"),
                ItemNumber = Str(r, "ItemNumber"),
                Description = Str(r, "Description"),
                OuterDia = Str(r, "OuterDia"),
                Thickness = Str(r, "Thickness"),
                Length = Str(r, "Length"),
                MaterialGrade = Str(r, "MaterialGrade"),
                OpeningQty = Dec(r, "OpeningQty"),
                ReceivedQty = Dec(r, "ReceivedQty"),
                ProductionQty = Dec(r, "ProductionQty"),
                InwardSum = Dec(r, "InwardSum"),
                ConsumptionQty = Dec(r, "ConsumptionQty"),
                DeliveredQty = Dec(r, "DeliveredQty"),
                OutwardSum = Dec(r, "OutwardSum"),
                ClosingQty = Dec(r, "ClosingQty")
            }).ToList();

            return new JsonResult(rows, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
        }
    }
}