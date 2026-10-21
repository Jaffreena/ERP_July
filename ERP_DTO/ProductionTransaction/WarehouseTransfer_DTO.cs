using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP_DTO.ProductionTransaction
{
    // ===================== SAVE (CREATE) =====================
    public class WarehouseTransferCreate_DTO
    {
        public WarehouseTransferHeader_DTO Header { get; set; } = new();
        public List<WarehouseTransferItem_DTO> Items { get; set; } = new();
        public List<WarehouseTransferBatch_DTO> Batches { get; set; } = new();
    }

    public class WarehouseTransferHeader_DTO
    {
        public long WHTH_Number { get; set; }

        [Display(Name = "Journal No.")]
        [StringLength(25)]
        public string? WHTH_JournalNo { get; set; }
        [Display(Name = "Date")]
        [DataType(DataType.Date)]
        public DateTime WHTH_Date { get; set; }

        [Display(Name = "Material Segregation")]
        public long WHTH_MS_Number { get; set; }

        public int? CreatorCode { get; set; }
    }

    public class WarehouseTransferItem_DTO
    {
        public int RowIndex { get; set; }                 // item grid row index (0-based, batch mapping)
        public long WHTI_Number { get; set; }
        public long WHTI_WHTH_Number { get; set; }

        public long WHTI_Item_Number { get; set; }
        public long WHTI_From_WH_Number { get; set; }
        public long WHTI_UoM_Number { get; set; }
        public decimal WHTI_Qty { get; set; }
        public long WHTI_To_WH_Number { get; set; }
    }

    public class WarehouseTransferBatch_DTO
    {
        public int WHTI_BCH_WHTI_Number { get; set; }      // = item RowIndex (0-based)
        public long WHTI_BCH_FWH_Number { get; set; }
        public DateTime WHTI_BCH_BatchDate { get; set; }
        public string? WHTI_BCH_BatchNo { get; set; }
        public decimal WHTI_BCH_BatchQty { get; set; }
        public decimal WHTI_BCH_BatchUnitPrice { get; set; }
        public decimal WHTI_BCH_BatchValue { get; set; }
        public long WHTI_BCH_TWH_Number { get; set; }

        public long WHTI_BCH_RefBatch_Number { get; set; } // source IN_COMMON_BATCH line batch
    }

    // ===================== TEMP (batch reservation, Temp_DeliveryNoteBatch) =====================
    public class WarehouseTransferTempBatch_DTO
    {
        public int DBCH_Index { get; set; }               // item grid row
        public long DBCH_Item_Number { get; set; }
        public long DBCH_DBCH_Number { get; set; }        // source batch (LineBatch_Number)
        public long DBCH_Warehouse_Number { get; set; }
        public DateTime DBCH_Date { get; set; }
        public string? DBCH_No { get; set; }
        public decimal DBCH_Qty { get; set; }
        public decimal? DBCH_UnitPrice { get; set; }
        public decimal? DBCH_Value { get; set; }
        public int CreatorCode { get; set; }
    }

    public class WarehouseTransferDeletedRowInfo_DTO
    {
        public int ItemGridindex { get; set; }
        public long DBCH_Item_Number { get; set; }
        public long DBCH_DBCH_Number { get; set; }
    }

    // ===================== BATCH POPUP (WHT_GetBatch_SP) =====================
    public class WarehouseTransferBatchList_DTO
    {
        public long LineBatch_Number { get; set; }
        public long FromWarehouse { get; set; }
        public DateTime BatchDate { get; set; }
        public string? BatchNo { get; set; }
        public decimal BatchQty { get; set; }
        public decimal ReservedQty { get; set; }
        public decimal DeliveredQty { get; set; }
        public decimal AvailableQty { get; set; }
        public decimal BatchUnitPrice { get; set; }
        public decimal BatchValue { get; set; }
        public string? WarehouseCode { get; set; }
        public string? ItemStatus { get; set; }
    }

    // ===================== MASTERS (WHT_SP Id 1) =====================
    public class WarehouseTransferUoM_DTO { public long UnitNumber { get; set; } public string? UnitCode { get; set; } public int DecimalPlaces { get; set; } }
    public class WarehouseTransferWarehouse_DTO { public long WarehouseNumber { get; set; } public string? WarehouseCode { get; set; } }
    public class WarehouseTransferMS_DTO { public long Number { get; set; } public string? Segregation { get; set; } }
    // ===================== NUMBERING (WHT_Numbering_SP) =====================
    public class WarehouseTransferNumbering_DTO
    {
        public long WHTN_Number { get; set; }
        public long WHTN_Method { get; set; }
        public int WHTN_Date { get; set; }
        public int WHTN_EndDate { get; set; }
        public int WHTN_StartingNumber { get; set; }
        public int WHTN_NumberofDigits { get; set; }
        public long WHTN_PrefilZero { get; set; }
        public long WHTN_Frequency { get; set; }
        public string? WHTN_Particulars { get; set; }
        public string? DeleteNumbers { get; set; }
        public int CreatorCode { get; set; }
    }

    public class WarehouseTransferNumberPage_DTO
    {
        public long WHTN_Number { get; set; }
        public string? WHTN_Method { get; set; }
        public List<WarehouseTransferNumberReset_DTO> WHT_NumberReset { get; set; } = new();
        public List<WarehouseTransferNumberPrefix_DTO> WHT_NumberPrefix { get; set; } = new();
        public List<WarehouseTransferNumberSuffix_DTO> WHT_NumberSuffix { get; set; } = new();
    }

    public class WarehouseTransferNumberReset_DTO
    {
        public long WHTR_Number { get; set; }
        public string? WHTR_Date { get; set; }
        public string? WHTR_EndDate { get; set; }
        public int WHTR_StartingNumber { get; set; }
        public int WHTR_NumberofDigits { get; set; }
        public long WHTR_PrefilZero { get; set; }
        public long WHTR_Frequency { get; set; }
        public bool WHTR_IsDeleted { get; set; }
    }

    public class WarehouseTransferNumberPrefix_DTO
    {
        public long WHTP_Number { get; set; }
        public string? WHTP_Date { get; set; }
        public string? WHTP_EndDate { get; set; }
        public string? WHTP_Particulars { get; set; }
        public bool WHTP_IsDeleted { get; set; }
    }

    public class WarehouseTransferNumberSuffix_DTO
    {
        public long WHTS_Number { get; set; }
        public string? WHTS_Date { get; set; }
        public string? WHTS_EndDate { get; set; }
        public string? WHTS_Particulars { get; set; }
        public bool WHTS_IsDeleted { get; set; }
    }

    // ===================== SUMMARY (WHT_Summary_SP) =====================
    public class WarehouseTransferSummary_DTO
    {
        public string? WHTH_JournalNo { get; set; }
        public long WHTH_Number { get; set; }
        public string? WHTH_Date { get; set; }
        public string? Segregation { get; set; }
        public int? NoOfLines { get; set; }
        public decimal? TotalQty { get; set; }
    }

    // ===================== DETAILED (WHT_Detailed_SP) =====================
    public class WarehouseTransferDetailed_DTO
    {
        public string? WHTH_JournalNo { get; set; }
        public long? WHTH_Number { get; set; }
        public string? WHTH_Date { get; set; }
        public string? Segregation { get; set; }

        public long? WHTI_Number { get; set; }
        public string? ItemCode { get; set; }
        public string? ItemDescription { get; set; }
        public string? OuterDia { get; set; }
        public string? Thickness { get; set; }
        public string? Length { get; set; }
        public string? MaterialGrade { get; set; }
        public string? ItemGroup { get; set; }
        public string? FromWHCode { get; set; }
        public string? ToWHCode { get; set; }
        public string? UOMCode { get; set; }
        public decimal? WHTI_Qty { get; set; }
    }
}