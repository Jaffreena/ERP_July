using ERP.Models;
using ERP_DAO.JobInwardTransaction;    // StockMovement_DAO, reused only for the dropdown lists
using ERP_DAO.JobOutwardTransaction;
using ERP_DTO.JobOutwardTransaction;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using System.Text.Json;

namespace ERP.Controllers.JobworkOutward.Report
{
    public class JOStockClosingController : Controller
    {
        JOStockClosing_DAO SC_DAO = new JOStockClosing_DAO();
        StockMovement_DAO SM_DAO = new StockMovement_DAO();   // reused only for the dropdown lists
        Help Help = new Help();

        [HttpGet]
        public IActionResult Index()
        {
            ViewBag.ItemGroup = Help.GetCat(SM_DAO.GetItemGroupList().Tables[0]);
            ViewBag.Warehouse = Help.GetCat(SM_DAO.GetWarehouseList().Tables[0]);
            ViewBag.Item = Help.GetCat(SM_DAO.GetItemList().Tables[0]);
            ViewBag.Collapse = true;
            return View(new JOStockClosingReport_DTO());
        }

        [HttpGet]
        public JsonResult GetStockClosingData(DateTime? FromDate, DateTime? ToDate,
            long? ItemGroupNumber, long? WarehouseNumber, long? ItemNumber)
        {
            var filter = new JOStockClosingFilter_DTO
            {
                FromDate = FromDate,
                ToDate = ToDate,
                ItemGroupNumber = ItemGroupNumber,
                WarehouseNumber = WarehouseNumber,
                ItemNumber = ItemNumber
            };

            DataTable dt = SC_DAO.GetStockClosingDB(filter).Tables[0];

            string Str(DataRow r, string c) => r[c] == DBNull.Value ? "" : r[c].ToString();

            var rows = dt.AsEnumerable().Select(r => new
            {
                ItemGroupName = Str(r, "ItemGroupName"),
                ItemNumber = Str(r, "ItemNumber"),
                Description = Str(r, "Description"),
                OuterDia = Str(r, "OuterDia"),
                Thickness = Str(r, "Thickness"),
                Length = Str(r, "Length"),
                MaterialGrade = Str(r, "MaterialGrade"),
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