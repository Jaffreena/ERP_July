using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP_DTO.JobOutwardTransaction
{
    public class JO_DeletedRowInfo_DTO
    {
        public int ItemGridindex { get; set; }
        public long JODNI_Number { get; set; }
        public long JODNH_Number { get; set; }
        public long DBCH_Item_Number { get; set; }
        public long DBCH_DBCH_Number { get; set; }
    }

    public class JO_DeliveryNoteCreate_DTO
    {
        public JO_DeliveryNoteHeader_DTO Header { get; set; }
        public List<JO_DeliveryNoteItem_DTO> Items { get; set; }
        public List<JO_DeliveryNoteBatch_DTO> deliveryNoteBatches { get; set; }
        public List<JO_DeliveryNoteAddress_DTO> Addresses { get; set; }

        public JO_DeliveryNoteCreate_DTO()
        {
            Header = new JO_DeliveryNoteHeader_DTO();
            Items = new List<JO_DeliveryNoteItem_DTO>();
            Addresses = new List<JO_DeliveryNoteAddress_DTO>();
            deliveryNoteBatches = new List<JO_DeliveryNoteBatch_DTO>();
        }
    }

    public class JO_DeliveryNoteHeader_DTO
    {
        public long JODNH_Number { get; set; }

        [Display(Name = "Delivery Note No.")]
        [StringLength(25)]
        public string JODNH_DN_No { get; set; }

        [Display(Name = "Date")]
        [DataType(DataType.Date)]
        public DateTime JODNH_DN_Date { get; set; }

        [Display(Name = "Material Segregation")]
        public long JODNH_MS_Number { get; set; }

        [Display(Name = "JW Vendor")]
        public long JODNH_JW_Vendor_Number { get; set; }
        public string? JODNI_Item_Code { get; set; } = null;     // vendor search text
        public string? JODNH_JW_Vendor_Name { get; set; }

        [Display(Name = "Currency")]
        public long JODNH_Currency_Number { get; set; }

        [Display(Name = "Warehouse")]
        public long JODNH_WH_Number { get; set; }

        [Display(Name = "Freight Applicable")]
        [StringLength(10)]
        public string? JODNH_IsFreightApplicable { get; set; }

        [Display(Name = "Terms of Payment")]
        [StringLength(50)]
        public string? JODNH_PaymentTerms { get; set; }

        [Display(Name = "Terms of Delivery")]
        [StringLength(50)]
        public string? JODNH_DeliveryTerms { get; set; }

        [Display(Name = "Mode of Delivery")]
        [StringLength(50)]
        public string? JODNH_DeliveryMode { get; set; }

        [Display(Name = "Despatch Document No.")]
        [StringLength(50)]
        public string? JODNH_DespatchDocumentNo { get; set; }

        [Display(Name = "Despatched Through")]
        [StringLength(50)]
        public string? JODNH_DespatchedThrough { get; set; }

        [Display(Name = "Remarks")]
        [StringLength(250)]
        public string? JODNH_Remarks { get; set; }

        // SP / lookup parameters
        public int? DN_Id { get; set; }
        public long? DN_JWV_Number { get; set; }
        public long? DN_ADD_ADTP_Number { get; set; }
        public string? DN_ADD_Addressid { get; set; }
        public int? DN_CreatorCode { get; set; }

        // Edit / View display fields
        public string? JODNH_Warehouse { get; set; }
        public string? JODNH_VendorName { get; set; }
        public string? JODNH_CurrencyCode { get; set; }
        public string? JODNH_Segregation { get; set; }
    }

    public class JO_DeliveryNoteItem_DTO
    {
        public long JODNI_JODNH_Number { get; set; }
        public long JODNI_Number { get; set; }

        [Display(Name = "Process")]
        public long JODNI_JPRS_Number { get; set; }

        [Display(Name = "Item")]
        public long JODNI_Item_Number { get; set; }

        [Display(Name = "Warehouse")]
        public long JODNI_WH_Number { get; set; }

        [Display(Name = "UoM")]
        public long JODNI_UoM_Number { get; set; }

        [Display(Name = "Quantity")]
        public double JODNI_Qty { get; set; }

        [Display(Name = "Quantity (Kgs)")]
        public double JODNI_Qty_Kgs { get; set; }

        [Display(Name = "Unit Price")]
        public double JODNI_UnitPrice { get; set; }

        [Display(Name = "Amount")]
        public double JODNI_Amount { get; set; }

        [Display(Name = "Freight Applicable")]
        [StringLength(10)]
        public string? JODNI_IsFreightApplicable { get; set; }

        [Display(Name = "From Warehouse")]
        public long? JODNI_FromWH_Number { get; set; }

        [Display(Name = "To Warehouse")]
        public long? JODNI_ToWH_Number { get; set; }

        [Display(Name = "Freight No")]
        public long? JODNI_JOFRT_SVOH_Number { get; set; }

        // Freight SO Item ID (used by freight qty check)
        public long? JODNI_JOFRT_SVOI_Number { get; set; }

        // Display fields (Edit / View SP)
        public string? JODNI_ProcessName { get; set; }
        public string? JODNI_ItemName { get; set; }
        public string? JODNI_ItemDescription { get; set; }
        public string? JODNI_Item_Code { get; set; }
        public string? JODNI_Item_Description { get; set; }
        public string? JODNI_OuterDia { get; set; }
        public string? JODNI_Thickness { get; set; }
        public string? JODNI_Length { get; set; }
        public string? JODNI_Width { get; set; }
        public string? JODNI_MaterialGrade { get; set; }
        public string? JODNI_ItemGroup { get; set; }
        public string? JODNI_UOM { get; set; }
        public string? JODNI_Warehouse { get; set; }

        public string? JODNI_IsDeleted { get; set; }
        public long? VendorNumber { get; set; }
    }

    public class JO_DeliveryNoteAddress_DTO
    {
        public long JODNA_JODNH_Number { get; set; }
        public long JODNA_Number { get; set; }

        [Display(Name = "Address Type")]
        public long JODNA_ADTP_Number { get; set; }

        [Display(Name = "Address ID")]
        [StringLength(25)]
        public string JODNA_Address_ID { get; set; }

        [Display(Name = "Address")]
        [StringLength(250)]
        public string? JODNA_Address { get; set; }

        [Display(Name = "City")]
        [StringLength(25)]
        public string? JODNA_City { get; set; }

        [Display(Name = "State")]
        [StringLength(25)]
        public string? JODNA_State { get; set; }

        [Display(Name = "Country")]
        [StringLength(25)]
        public string? JODNA_Country { get; set; }

        [Display(Name = "PIN")]
        [StringLength(10)]
        public string? JODNA_PIN { get; set; }

        [Display(Name = "GSTIN")]
        [StringLength(15)]
        public string? JODNA_GSTIN { get; set; }

        public int? JODNA_ADD_IsDeleted { get; set; }
    }

    public class JO_DeliveryNoteSummary_DTO
    {
        public long JODNH_Number { get; set; }
        public int DN_Id { get; set; }
        public int DN_CreatorCode { get; set; }
        public string? JODNH_DN_No { get; set; }
        public DateTime JODNH_DN_Date { get; set; }
        public long JODNH_JW_Vendor_Number { get; set; }
        public long JWV_JVG_Number { get; set; }
        public string? JVG_JW_VendorGroup { get; set; }
        public string? JVC_JW_VendorCategory { get; set; }
        public string? JWV_JW_VendorName { get; set; }
        public string? CurrencyCode { get; set; }
        public string? WarehouseCode { get; set; }
        public long JODNH_MS_Number { get; set; }
        public string? JODNH_IsFreightApplicable { get; set; }
        public string? Segregation { get; set; }
        public int NoOfLineItems { get; set; }
        public string Qty { get; set; }
        public double Amount { get; set; }
        public string? VendorWareHouse { get; set; }
        public string? ItemWareHouse { get; set; }
    }

    public class JO_DeliveryNoteDetailed_DTO
    {
        public long JODNH_Number { get; set; }
        public string JODNH_DN_No { get; set; }
        public DateTime JODNH_DN_Date { get; set; }
        public long JODNH_JW_Vendor_Number { get; set; }

        public long JWV_JVG_Number { get; set; }
        public string JVG_JW_VendorGroup { get; set; }
        public string JVC_JW_VendorCategory { get; set; }
        public string JWV_JW_VendorName { get; set; }

        public string CurrencyCode { get; set; }
        public string WarehouseCode { get; set; }

        public long JODNH_MS_Number { get; set; }

        public string VendorWareHouse { get; set; }
        public string ItemWareHouse { get; set; }
        public string Segregation { get; set; }

        public long JODNI_JPRS_Number { get; set; }
        public long JODNI_Item_Number { get; set; }

        public string Process { get; set; }
        public string ItemGroup { get; set; }

        public string ItemCode { get; set; }
        public string ItemDescription { get; set; }

        public decimal OuterDia { get; set; }
        public decimal Thickness { get; set; }
        public decimal ItemLength { get; set; }
        public decimal? ITM_Width { get; set; }

        public string MaterialGrade { get; set; }
        public string Warehouse { get; set; }
        public string UOM { get; set; }

        public decimal JODNI_Qty { get; set; }
        public decimal JODNI_Qty_Kgs { get; set; }
        public decimal JODNI_UnitPrice { get; set; }
        public decimal JODNI_Amount { get; set; }

        public string JODNI_IsFreightApplicable { get; set; }
    }

    public class JO_DeliveryNoteBatch_DTO
    {
        public long JODNI_BCH_Number { get; set; }
        public long JODNI_BCH_JODNH_Number { get; set; }
        public long JODNI_BCH_JODNI_Number { get; set; }
        public long JODNI_BCH_WH_Number { get; set; }
        public DateTime JODNI_BCH_BatchDate { get; set; }
        public string JODNI_BCH_BatchNo { get; set; }
        public decimal JODNI_BCH_BatchQty { get; set; }
        public decimal JODNI_BCH_BatchUnitPrice { get; set; }
        public decimal JODNI_BCH_BatchValue { get; set; }

        public decimal RefBatch_Number { get; set; }
        public decimal JODNH_Number { get; set; }
        public decimal JODNI_Number { get; set; }
    }

    public class JO_TempDeliveryBatch_DTO
    {
        public string? DBCH_RowGuid { get; set; }
        public long DBCH_Number { get; set; }
        public int DBCH_Index { get; set; }
        public long? DBCH_DBCH_Number { get; set; }
        public long DBCH_Item_Number { get; set; }

        public long? JODNI_Number { get; set; }
        public long? JODNH_Number { get; set; }
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

    // ---------- Vendor search / address lookup ----------

    public class JO_DNVendor_DTO
    {
        public long JWV_WH_Number { get; set; }
        public long JWV_Number { get; set; }
        public string? JWV_JW_VendorName { get; set; }
        public long JWV_Currency_Number { get; set; }
        public string? CurrencyCode { get; set; }
        public string? JWV_CUR_Name { get; set; }
        public int JWV_CUR_DecimalPlaces { get; set; }
        public long JWV_WHT_Number { get; set; }
        public long JWV_TCT_Number { get; set; }
    }

    public class JO_DNVendorAddress_DTO
    {
        public long JWV_ADD_Number { get; set; }
        public long JWV_ADD_ADTP_Number { get; set; }
        public string? JWV_ADD_Address_ID { get; set; }
        public string? JWV_ADD_Address { get; set; }
        public string? JWV_ADD_City { get; set; }
        public string? JWV_ADD_State { get; set; }
        public string? JWV_ADD_Country { get; set; }
        public string? JWV_ADD_PIN { get; set; }
        public string? JWV_ADD_GSTIN { get; set; }
    }

    public class JO_DNAddressLookup_DTO
    {
        public List<JO_DNVendorAddress_DTO> AddressIds { get; set; }
        public JO_DNVendorAddress_DTO? Address { get; set; }
    }
}