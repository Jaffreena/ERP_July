using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{
    public class ItemTrackByDCFilter_DTO
    {
        public DateTime? FromDate { get; set; }        // RN Date from
        public DateTime? ToDate { get; set; }          // RN Date to
        public string DCNo { get; set; }               // Customer DC No (LIKE)
        public long? CustomerNumber { get; set; }      // JW_Customer.CUS_Number
        public long? ItemGroupNumber { get; set; }     // mother (RN) item group
        public long? ItemNumber { get; set; }          // mother (RN) item
        public string BatchNo { get; set; }            // mother or child batch -> whole DC tree
    }

    public class ItemTrackByDCRow_DTO
    {
        public long HeaderNo { get; set; }             // RN header number
        public long MotherId { get; set; }             // mother batch id (groups a tree)
        public int Lvl { get; set; }                   // 1 = mother (Receipt), 2+ = conversion child

        public string DCNo { get; set; }
        public DateTime? DCDate { get; set; }
        public DateTime? RNDate { get; set; }
        public string JWCustomerName { get; set; }

        public string ItemGroupName { get; set; }
        public string ItemNumber { get; set; }         // Item Code text
        public string Description { get; set; }
        public string OuterDia { get; set; }
        public string Thickness { get; set; }
        public string Length { get; set; }
        public string MaterialGrade { get; set; }

        public decimal? ItemQty { get; set; }          // Qty column, mother rows only
        public string Warehouse { get; set; }
        public DateTime? BatchDate { get; set; }
        public string BatchNo { get; set; }
        public decimal BatchQty { get; set; }

        public decimal Received { get; set; }
        public decimal Production { get; set; }
        public decimal InwardSum { get; set; }
        public decimal Consumption { get; set; }
        public decimal Delivered { get; set; }
        public decimal OutwardSum { get; set; }
        public decimal ClosingQty { get; set; }
    }

    public class ItemTrackByDCReport_DTO
    {
        public ItemTrackByDCFilter_DTO Filter { get; set; } = new();
        public List<ItemTrackByDCRow_DTO> Rows { get; set; } = new();

        public decimal TotalItemQty => Rows.Sum(r => r.ItemQty ?? 0);
        public decimal TotalBatchQty => Rows.Sum(r => r.BatchQty);
        public decimal TotalReceived => Rows.Sum(r => r.Received);
        public decimal TotalProduction => Rows.Sum(r => r.Production);
        public decimal TotalInward => Rows.Sum(r => r.InwardSum);
        public decimal TotalConsumption => Rows.Sum(r => r.Consumption);
        public decimal TotalDelivered => Rows.Sum(r => r.Delivered);
        public decimal TotalOutward => Rows.Sum(r => r.OutwardSum);
        public decimal TotalClosing => Rows.Sum(r => r.ClosingQty);
    }
}