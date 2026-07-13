using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{
    public class ConversionDeletedRowInfo_DTO
    {
        public int ItemGridindex { get; set; }

        public long JIDNI_Number { get; set; }

        public long JIDNH_Number { get; set; }

        public long DBCH_Item_Number { get; set; }

        public long DBCH_DBCH_Number { get; set; }
    }
    public class ConversionCreate_DTO
    {
        public ConversionHeader_DTO Header { get; set; }

        public List<ConversionItem_DTO> Items { get; set; }

        public List<ConversionBatch_DTO> deliveryNoteBatches { get; set; }


        public List<ReceiptNoteItem_DTO>? Items_Production { get; set; } = new();
        public List<ReceiptNoteBatch_DTO>? ItemBatch_Production { get; set; } = new();

        public List<ReceiptNoteItem_DTO>? Items_Scrap { get; set; } = new();
        public List<ReceiptNoteBatch_DTO>? ItemBatch_Scrap { get; set; } = new();

        public ConversionCreate_DTO()
        {
            Header = new ConversionHeader_DTO();

            Items = new List<ConversionItem_DTO>();

           deliveryNoteBatches = new List<ConversionBatch_DTO>();

            Items_Production = new List<ReceiptNoteItem_DTO>();

            ItemBatch_Production = new List<ReceiptNoteBatch_DTO>();
            Items_Scrap = new List<ReceiptNoteItem_DTO>();

            ItemBatch_Scrap = new List<ReceiptNoteBatch_DTO>();
        }

    }
    public class ConversionHeader_DTO
    {
        public long JIDNH_Number { get; set; }

        [Display(Name = "Conversion Journal No.")]
        [StringLength(25)]
        public string JIDNH_DN_No { get; set; }

        [Display(Name = "Date")]
        [DataType(DataType.Date)]
        public DateTime JIDNH_DN_Date { get; set; }

        [Display(Name = "Material Segregation")]
        public long JIDNH_MS_Number { get; set; }

        [Display(Name = "Work Centre")]
        public long JIDNH_WC_Number { get; set; }

        [Display(Name = "Shift")]
        public long JIDNH_Shift_Number { get; set; }

        [Display(Name = "Process")]
        public long JIDNH_PRS_Number { get; set; }

        [Display(Name = "Operator")]
        public string JIDNH_Operator_Number { get; set; }

        //[Display(Name = "JW Customer")]
        //public long JIDNH_JW_Customer_Number { get; set; }
        public string? JIDNI_Item_Code { get; set; } = null;
        //public string? JIDNH_JW_Customer_Name { get; set; }

        //[Display(Name = "Currency")]
        //public long JIDNH_Currency_Number { get; set; }

        //[Display(Name = "Warehouse")]
        //public long JIDNH_WH_Number { get; set; }

        //[Display(Name = "Terms of Payment")]
        //[StringLength(50)]
        //public string? JIDNH_PaymentTerms { get; set; }

        //[Display(Name = "Terms of Delivery")]
        //[StringLength(50)]
        //public string? JIDNH_DeliveryTerms { get; set; }

        //[Display(Name = "Mode of Delivery")]
        //[StringLength(50)]
        //public string? JIDNH_DeliveryMode { get; set; }

        //[Display(Name = "Despatch Document No.")]
        //[StringLength(50)]
        //public string? JIDNH_DespatchDocumentNo { get; set; }

        //[Display(Name = "Despatched Through")]
        //[StringLength(50)]
        //public string? JIDNH_DespatchedThrough { get; set; }

        //[Display(Name = "Remarks")]
        //[StringLength(250)]
        //public string? JIDNH_Remarks { get; set; }

        public int? DN_Id { get; set; }
        public int? DN_CUS_Number { get; set; }
        public int? DN_ADD_ADTP_Number { get; set; }
        public int? DN_CreatorCode { get; set; }

        public string? JIDNH_Warehouse { get; set; }
        public string? JIDNH_CustomerName { get; set; }
        public string? JIDNH_CurrencyCode { get; set; }
        public string? JIDNH_Segregation { get; set; }

        

    }

    public class ConversionItem_DTO
    {
        public long JIDNI_JIDNH_Number { get; set; }

        public long JIDNI_Number { get; set; }

        [Display(Name = "PRS Number")]
        public long JIDNI_PRS_Number { get; set; }

        [Display(Name = "Item")]
        public long JIDNI_Item_Number { get; set; }

        [Display(Name = "Warehouse")]
        public long JIDNI_WH_Number { get; set; }

        [Display(Name = "UoM")]
        public long JIDNI_UoM_Number { get; set; }

        [Display(Name = "Quantity")]
        public double JIDNI_Qty { get; set; }

        [Display(Name = "Unit Price")]
        public double JIDNI_UnitPrice { get; set; }

        [Display(Name = "Amount")]
        public double JIDNI_Amount { get; set; }

        [Display(Name = "JW Invoice Tracking")]
        [StringLength(3)]
        public string JIDNI_JW_InvoiceTracking { get; set; }

        public string? JIDNI_JW_ProcessName { get; set; }
        public string? JIDNI_JW_ItemName { get; set; }
        public string? JIDNI_JW_ItemDescription { get; set; }

        public string? JIDNI_JW_OuterDia { get; set; }

        public string? JIDNI_JW_Thickness { get; set; }

        public string? JIDNI_JW_Length { get; set; }

        public string? JIDNI_JW_ITM_Width { get; set; }

        public string? JIDNI_JW_MaterialGrade { get; set; }

        public string? JIDNI_UOM { get; set; }
        public string? JIDNI_Warehouse { get; set; }

        public string? JIDNI_Item_Code { get; set; }
        public string? JIDNI_Width { get; set; }
        public string? JIDNI_Item_Description { get; set; }
        public string? JIDNI_OuterDia { get; set; }
        public string? JIDNI_Thickness { get; set; }
        public string? JIDNI_Length { get; set; }
        public string? JIDNI_MaterialGrade { get; set; }
        public string? JIDNI_ItemGroup { get; set; }
        public string? JIDNI_IsDeleted { get; set; }
        public long? CustomerNumber { get; set; }
        public long? JISVOH_Number { get; set; }
        public long? JISVOI_Number { get; set; }
       



    }

       public class ConversionOutCommonBatch_DTO
    {
        public string TransType { get; set; }
        public long Header_Number { get; set; }
        public long LineItem_Number { get; set; }
        public long LineBatch_Number { get; set; }
        public long Warehouse { get; set; }
        public DateTime BatchDate { get; set; }
        public string BatchNo { get; set; }
        public string ItemStatus { get; set; }
        public decimal BatchQty { get; set; }
        public decimal BatchUnitPrice { get; set; }
        public decimal BatchValue { get; set; }
    }
    public class ConversionBatch_DTO
    {
        public long JIDNI_BCH_Number { get; set; }

        public long JIDNI_BCH_JIDNH_Number { get; set; }

        public long JIDNI_BCH_JIDNI_Number { get; set; }

        public long JIDNI_BCH_WH_Number { get; set; }

        public DateTime JIDNI_BCH_BatchDate { get; set; }

        public string JIDNI_BCH_BatchNo { get; set; }

        

        public decimal JIDNI_BCH_BatchQty { get; set; }

        public decimal JIDNI_BCH_BatchUnitPrice { get; set; }

        public decimal JIDNI_BCH_BatchValue { get; set; }

        public decimal RefBatch_Number { get; set; }
        public decimal JIDNH_Number { get; set; }
        public decimal JIDNI_Number { get; set; }
    }

    public class ConversionTempDeliveryBatch_DTO
    {
        public string? DBCH_RowGuid { get; set; }
        public long DBCH_Number { get; set; }

        public int DBCH_Index { get; set; }

        public long? DBCH_DBCH_Number { get; set; }

        public long DBCH_Item_Number { get; set; }

        public long? JIDNI_NUMBER { get; set; }
        public long? JIDNH_NUMBER { get; set; }
        public long? RefBatch_Number { get; set; }

        public long DBCH_Warehouse_Number { get; set; }

        public DateTime DBCH_Date { get; set; }

        public string DBCH_No { get; set; }

        public decimal DBCH_Qty { get; set; }

        public decimal? DBCH_UnitPrice { get; set; }

        public decimal? DBCH_Value { get; set; }

        public int? Mode { get; set; }

        public int CreatorCode { get; set; }

        public DateTime CreatorDate { get; set; }
    }

    public class ConversionDetailed_DTO
    {
        // ================= HEADER =================
        public string JICNVH_ConvJournalNo { get; set; }
        public long JICNVH_Number { get; set; }
        public string JICNVH_Date { get; set; }

        public long? JICNVH_SFT_Number { get; set; }
        public long? JICNVH_WC_Number { get; set; }
        public long? JICNVH_PRS_Number { get; set; }

        public string SFT_ShiftName { get; set; }
        public string WC_WorkCentre { get; set; }
        public string PRS_ProcessName { get; set; }

        // ================= CONSUMPTION =================
        public long? JICNVC_Number { get; set; }
        public long? Cons_Item { get; set; }
        public long? Cons_WH { get; set; }
        public long? JICNVC_UoM_Number { get; set; }
        public decimal? JICNVC_ConsQty { get; set; }

        public string Cons_ItemCode { get; set; }
        public string Cons_ItemDescription { get; set; }
        public decimal? Cons_OuterDia { get; set; }
        public decimal? Cons_Thickness { get; set; }
        public decimal? Cons_Length { get; set; }
        public decimal? Cons_Width { get; set; }
        public string Cons_MaterialGrade { get; set; }

        public string Cons_UOMCode { get; set; }
        public string Cons_UOMDescription { get; set; }

        public string Cons_ItemGroup { get; set; }
        public string Cons_ItemGroupName { get; set; }

        // ================= PRODUCTION =================
        public long? JICNVP_Number { get; set; }
        public long? Prod_Item { get; set; }
        public long? Prod_WH { get; set; }
        public long? JICNVP_UoM_Number { get; set; }
        public decimal? JICNVP_ProdQty { get; set; }

        public string Prod_ItemCode { get; set; }
        public string Prod_ItemDescription { get; set; }
        public decimal? Prod_OuterDia { get; set; }
        public decimal? Prod_Thickness { get; set; }
        public decimal? Prod_Length { get; set; }
        public decimal? Prod_Width { get; set; }
        public string Prod_MaterialGrade { get; set; }

        public string Prod_UOMCode { get; set; }
        public string Prod_UOMDescription { get; set; }

        public string Prod_ItemGroup { get; set; }
        public string Prod_ItemGroupName { get; set; }

        // ================= SCRAP =================
        public long? JICNVS_Number { get; set; }
        public long? Scrap_Item { get; set; }
        public long? Scrap_WH { get; set; }
        public long? JICNVS_UoM_Number { get; set; }
        public decimal? JICNVS_ScrapQty { get; set; }

        public string Scrap_ItemCode { get; set; }
        public string Scrap_ItemDescription { get; set; }
        public decimal? Scrap_OuterDia { get; set; }
        public decimal? Scrap_Thickness { get; set; }
        public decimal? Scrap_Length { get; set; }
        public decimal? Scrap_Width { get; set; }
        public string Scrap_MaterialGrade { get; set; }

        public string Scrap_UOMCode { get; set; }
        public string Scrap_UOMDescription { get; set; }

        public string Scrap_ItemGroup { get; set; }
        public string Scrap_ItemGroupName { get; set; }
        public string Cons_WHCode { get; set; }
        public string Prod_WHCode { get; set; }
        public string Scrap_WHCode { get; set; }
    }
    public class ConversionSummary_DTO
    {
        // ================= HEADER =================
        public string JICNVH_ConvJournalNo { get; set; }
        public long JICNVH_Number { get; set; }
        public string JICNVH_Date { get; set; }

        public long? JICNVH_SFT_Number { get; set; }
        public long? JICNVH_WC_Number { get; set; }
        public long? JICNVH_PRS_Number { get; set; }

        public string SFT_ShiftName { get; set; }
        public string WC_WorkCentre { get; set; }
        public string PRS_ProcessName { get; set; }

        // ================= CONSUMPTION =================
        public int? Cons_NoOfLines { get; set; }
        public string Cons_ItemCode { get; set; }
        public string Cons_ItemDescription { get; set; }
        public string Cons_UOMCode { get; set; }
        public decimal? Cons_Qty { get; set; }
        public string Cons_WHCode { get; set; }

        // ================= PRODUCTION =================
        public int? Prod_NoOfLines { get; set; }
        public string Prod_ItemCode { get; set; }
        public string Prod_ItemDescription { get; set; }
        public string Prod_UOMCode { get; set; }
        public decimal? Prod_Qty { get; set; }
        public string Prod_WHCode { get; set; }

        // ================= SCRAP =================
        public int? Scrap_NoOfLines { get; set; }
        public string Scrap_ItemCode { get; set; }
        public string Scrap_ItemDescription { get; set; }
        public string Scrap_UOMCode { get; set; }
        public decimal? Scrap_Qty { get; set; }
        public string Scrap_WHCode { get; set; }
    }
}
