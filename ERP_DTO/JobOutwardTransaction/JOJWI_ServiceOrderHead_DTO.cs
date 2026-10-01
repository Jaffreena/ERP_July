using System;
using System.Collections.Generic;

namespace ERP_DTO.JobOutwardTransaction
{
    #region JOJWI
    public class JOJWI_ServiceOrderHead_DTO
    {
        public long JOJWI_SVOH_Number { get; set; }
        public string JOJWI_SVOH_ServiceOrderNo { get; set; }
        public DateTime JOJWI_SVOH_ServiceOrderDate { get; set; }
        public long JOJWI_SVOH_MS_Number { get; set; }
        public long JOJWI_SVOH_JW_Vendor_Number { get; set; }
        public string JOJWI_SVOH_JW_Vendor_Name { get; set; }   // Display only
        public long JOJWI_SVOH_Currency_Number { get; set; }
        public string JOJWI_SVOH_PaymentTerms { get; set; }
        public string JOJWI_SVOH_DeliveryTerms { get; set; }
        public string JOJWI_SVOH_DeliveryMode { get; set; }
        public string JOJWI_SVOH_Tax { get; set; }
        public string JOJWI_SVOH_TDC { get; set; }
        public string JOJWI_SVOH_Remarks { get; set; }
    }

    public class JOJWI_ServiceOrderItem_DTO
    {
        public long JOJWI_SVOI_Number { get; set; }
        public bool JOJWI_SVOI_IsDeleted { get; set; }
        public long JOJWI_SVOI_JPRS_Number { get; set; }
        public long JOJWI_SVOI_Item_Number { get; set; }
        public long? JOJWI_SVOI_WH_Number { get; set; }
        public long JOJWI_SVOI_UoM_Number { get; set; }
        public double JOJWI_SVOI_Qty { get; set; }
        public double JOJWI_SVOI_UnitPrice { get; set; }
        public double JOJWI_SVOI_Amount { get; set; }
        public DateTime? JOJWI_SVOI_DeliveryDate { get; set; }

        // Joined / display-only columns from the Get SP
        public string JOJWI_SVOI_Item_Code { get; set; }
        public string Description { get; set; }
        public string OuterDia { get; set; }
        public string Thickness { get; set; }
        public string Length { get; set; }
        public string Width { get; set; }
        public string MaterialGrade { get; set; }
        public string ItemGroup { get; set; }
        public string WarehouseCode { get; set; }   // Display only

        // Edit-page only (from Get SP, not stored) - amend qty pattern
        public double AssignedQty { get; set; }
        public double InvoicedQty { get; set; }
        public double InvoiceToBeRaised { get; set; }
    }

    public class JOJWI_ServiceOrder_DTO
    {
        public JOJWI_ServiceOrderHead_DTO Header { get; set; }
        public List<JOJWI_ServiceOrderItem_DTO> Items { get; set; }
    }
    #endregion

    #region JOFRT
    public class JOFRT_ServiceOrderHead_DTO
    {
        public long JOFRT_SVOH_Number { get; set; }
        public string JOFRT_SVOH_ServiceOrderNo { get; set; }
        public DateTime JOFRT_SVOH_ServiceOrderDate { get; set; }
        public string JOFRT_SVOH_Category { get; set; }
        public long JOFRT_SVOH_JW_Vendor_Number { get; set; }
        public string JOFRT_SVOH_JW_Vendor_Name { get; set; }   // Display only
        public long JOFRT_SVOH_Currency_Number { get; set; }
        public string JOFRT_SVOH_PaymentTerms { get; set; }
        public string JOFRT_SVOH_DeliveryTerms { get; set; }
        public string JOFRT_SVOH_DeliveryMode { get; set; }
        public string JOFRT_SVOH_Tax { get; set; }
        public string JOFRT_SVOH_TDC { get; set; }
        public string JOFRT_SVOH_Remarks { get; set; }
    }

    public class JOFRT_ServiceOrderItem_DTO
    {
        public long JOFRT_SVOI_Number { get; set; }
        public bool JOFRT_SVOI_IsDeleted { get; set; }
        public long JOFRT_SVOI_JPRS_Number { get; set; }
        public long? JOFRT_SVOI_FromWH_Number { get; set; }
        public long? JOFRT_SVOI_ToWH_Number { get; set; }
        public long JOFRT_SVOI_UoM_Number { get; set; }
        public double JOFRT_SVOI_Qty { get; set; }
        public double JOFRT_SVOI_Rate { get; set; }
        public double JOFRT_SVOI_Amount { get; set; }

        // Edit-page only (from Get SP, not stored) - amend qty pattern
        public double AssignedQty { get; set; }
        public double InvoicedQty { get; set; }
        public double InvoiceToBeRaised { get; set; }
    }

    public class JOFRT_ServiceOrder_DTO
    {
        public JOFRT_ServiceOrderHead_DTO Header { get; set; }
        public List<JOFRT_ServiceOrderItem_DTO> Items { get; set; }
    }
    #endregion

    #region numbering (JOJWI / JOFRT service order number setup)

    #region JOJWI numbering
    public class JOJWI_SVO_Numbering_DTO
    {
        public Int64 JOJWI_SVO_Number { get; set; }
        public String? JOJWI_SVO_Method { get; set; }
        public String? JOJWI_SVO_Date { get; set; }
        public String? JOJWI_SVO_EndDate { get; set; }
        public String? JOJWI_SVO_StartingNumber { get; set; }
        public String? JOJWI_SVO_NumberofDigits { get; set; }
        public String? JOJWI_SVO_PrefilZero { get; set; }
        public String? JOJWI_SVO_Frequency { get; set; }
        public String? JOJWI_SVO_Particulars { get; set; }

        public List<JOJWI_SVO_NumberReset_DTO>? JOJWI_SVO_NumberReset { get; set; }
        public List<JOJWI_SVO_NumberPrefix_DTO>? JOJWI_SVO_NumberPrefix { get; set; }
        public List<JOJWI_SVO_NumberSuffix_DTO>? JOJWI_SVO_NumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.JOJWI_SVO_Number = 0;
            this.JOJWI_SVO_Date = "0";
            this.JOJWI_SVO_Method = "0";
            this.JOJWI_SVO_StartingNumber = "0";
            this.JOJWI_SVO_NumberofDigits = "0";
            this.JOJWI_SVO_PrefilZero = "0";
            this.JOJWI_SVO_Frequency = "0";
            this.DeleteNumbers = "0";
            this.JOJWI_SVO_NumberReset = null;
            this.JOJWI_SVO_NumberPrefix = null;
            this.JOJWI_SVO_NumberSuffix = null;
        }
    }

    public class JOJWI_SVO_NumberReset_DTO
    {
        public Int64 JOJWI_SVO_NRS_Number { get; set; }
        public String? JOJWI_SVO_NRS_StartDate { get; set; }
        public String? JOJWI_SVO_NRS_EndDate { get; set; }
        public String? JOJWI_SVO_NRS_StartingNumber { get; set; }
        public String? JOJWI_SVO_NRS_NumberofDigits { get; set; }
        public String? JOJWI_SVO_NRS_PrefilZero { get; set; }
        public String? JOJWI_SVO_NRS_Frequency { get; set; }
        public Boolean JOJWI_SVO_NRS_IsDeleted { get; set; }
    }

    public class JOJWI_SVO_NumberPrefix_DTO
    {
        public Int64 JOJWI_SVO_PFX_Number { get; set; }
        public String? JOJWI_SVO_PFX_StartDate { get; set; }
        public String? JOJWI_SVO_PFX_EndDate { get; set; }
        public String? JOJWI_SVO_PFX_Particulars { get; set; }
        public Boolean JOJWI_SVO_PFX_IsDeleted { get; set; }
    }

    public class JOJWI_SVO_NumberSuffix_DTO
    {
        public Int64 JOJWI_SVO_SFX_Number { get; set; }
        public String? JOJWI_SVO_SFX_StartDate { get; set; }
        public String? JOJWI_SVO_SFX_EndDate { get; set; }
        public String? JOJWI_SVO_SFX_Particulars { get; set; }
        public Boolean JOJWI_SVO_SFX_IsDeleted { get; set; }
    }

    public class JOJWI_SVO_NextNumber_DTO
    {
        public int Id { get; set; }
        public DateTime JOJWI_SVO_Date { get; set; }
        public int NextNumber { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public int NumberOfDigits { get; set; }
        public bool PrefilZero { get; set; }
        public string FinalNumber { get; set; }
        public int CreatorCode { get; set; }
    }
    #endregion

    #region JOFRT numbering
    public class JOFRT_SVO_Numbering_DTO
    {
        public Int64 JOFRT_SVO_Number { get; set; }
        public String? JOFRT_SVO_Method { get; set; }
        public String? JOFRT_SVO_Date { get; set; }
        public String? JOFRT_SVO_EndDate { get; set; }
        public String? JOFRT_SVO_StartingNumber { get; set; }
        public String? JOFRT_SVO_NumberofDigits { get; set; }
        public String? JOFRT_SVO_PrefilZero { get; set; }
        public String? JOFRT_SVO_Frequency { get; set; }
        public String? JOFRT_SVO_Particulars { get; set; }

        public List<JOFRT_SVO_NumberReset_DTO>? JOFRT_SVO_NumberReset { get; set; }
        public List<JOFRT_SVO_NumberPrefix_DTO>? JOFRT_SVO_NumberPrefix { get; set; }
        public List<JOFRT_SVO_NumberSuffix_DTO>? JOFRT_SVO_NumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.JOFRT_SVO_Number = 0;
            this.JOFRT_SVO_Date = "0";
            this.JOFRT_SVO_Method = "0";
            this.JOFRT_SVO_StartingNumber = "0";
            this.JOFRT_SVO_NumberofDigits = "0";
            this.JOFRT_SVO_PrefilZero = "0";
            this.JOFRT_SVO_Frequency = "0";
            this.DeleteNumbers = "0";
            this.JOFRT_SVO_NumberReset = null;
            this.JOFRT_SVO_NumberPrefix = null;
            this.JOFRT_SVO_NumberSuffix = null;
        }
    }

    public class JOFRT_SVO_NumberReset_DTO
    {
        public Int64 JOFRT_SVO_NRS_Number { get; set; }
        public String? JOFRT_SVO_NRS_StartDate { get; set; }
        public String? JOFRT_SVO_NRS_EndDate { get; set; }
        public String? JOFRT_SVO_NRS_StartingNumber { get; set; }
        public String? JOFRT_SVO_NRS_NumberofDigits { get; set; }
        public String? JOFRT_SVO_NRS_PrefilZero { get; set; }
        public String? JOFRT_SVO_NRS_Frequency { get; set; }
        public Boolean JOFRT_SVO_NRS_IsDeleted { get; set; }
    }

    public class JOFRT_SVO_NumberPrefix_DTO
    {
        public Int64 JOFRT_SVO_PFX_Number { get; set; }
        public String? JOFRT_SVO_PFX_StartDate { get; set; }
        public String? JOFRT_SVO_PFX_EndDate { get; set; }
        public String? JOFRT_SVO_PFX_Particulars { get; set; }
        public Boolean JOFRT_SVO_PFX_IsDeleted { get; set; }
    }

    public class JOFRT_SVO_NumberSuffix_DTO
    {
        public Int64 JOFRT_SVO_SFX_Number { get; set; }
        public String? JOFRT_SVO_SFX_StartDate { get; set; }
        public String? JOFRT_SVO_SFX_EndDate { get; set; }
        public String? JOFRT_SVO_SFX_Particulars { get; set; }
        public Boolean JOFRT_SVO_SFX_IsDeleted { get; set; }
    }

    public class JOFRT_SVO_NextNumber_DTO
    {
        public int Id { get; set; }
        public DateTime JOFRT_SVO_Date { get; set; }
        public int NextNumber { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public int NumberOfDigits { get; set; }
        public bool PrefilZero { get; set; }
        public string FinalNumber { get; set; }
        public int CreatorCode { get; set; }
    }
    #endregion

    #endregion numbering

    #region register
    public class JOJWI_ServiceOrderSummary_DTO
    {
        public long JOJWI_SVOH_Number { get; set; }
        public int SO_Id { get; set; }
        public int SO_CreatorCode { get; set; }
        public string? JOJWI_SVOH_ServiceOrderNo { get; set; }
        public DateTime JOJWI_SVOH_ServiceOrderDate { get; set; }
        public long JOJWI_SVOH_JW_Vendor_Number { get; set; }
        public long JWV_JVG_Number { get; set; }
        public string? JVG_JW_VendorGroup { get; set; }
        public string? JVC_JW_VendorCategory { get; set; }
        public string? JWV_JW_VendorName { get; set; }
        public string? CurrencyCode { get; set; }
        public string? Process { get; set; }
        public int NoOfLineItems { get; set; }
        public double Qty { get; set; }
        public double Amount { get; set; }
    }

    public class JOJWI_ServiceOrderDetailed_DTO
    {
        public long JOJWI_SVOH_Number { get; set; }
        public int SO_Id { get; set; }
        public int SO_CreatorCode { get; set; }
        public string? JOJWI_SVOH_ServiceOrderNo { get; set; }
        public DateTime JOJWI_SVOH_ServiceOrderDate { get; set; }
        public long JOJWI_SVOH_JW_Vendor_Number { get; set; }
        public long JWV_JVG_Number { get; set; }
        public string? JVG_JW_VendorGroup { get; set; }
        public string? JVC_JW_VendorCategory { get; set; }
        public string? JWV_JW_VendorName { get; set; }
        public string? CurrencyCode { get; set; }
        public long JOJWI_SVOI_JPRS_Number { get; set; }
        public long JOJWI_SVOI_Item_Number { get; set; }
        public string? JPRS_ProcessName { get; set; }
        public string? ItemGroup { get; set; }
        public string? ItemCode { get; set; }
        public string? ItemDescription { get; set; }
        public string? OuterDia { get; set; }
        public string? Thickness { get; set; }
        public string? ItemLength { get; set; }
        public string? ITM_Width { get; set; }
        public string? MaterialGrade { get; set; }
        public string? WarehouseCode { get; set; }
        public string? UOM { get; set; }
        public double Qty { get; set; }
        public double UnitPrice { get; set; }
        public double Amount { get; set; }
        public DateTime? DeliveryDate { get; set; }
    }

    public class JOFRT_ServiceOrderSummary_DTO
    {
        public long JOFRT_SVOH_Number { get; set; }
        public int SO_Id { get; set; }
        public int SO_CreatorCode { get; set; }
        public string? JOFRT_SVOH_ServiceOrderNo { get; set; }
        public DateTime JOFRT_SVOH_ServiceOrderDate { get; set; }
        public string? JOFRT_SVOH_Category { get; set; }
        public long JOFRT_SVOH_JW_Vendor_Number { get; set; }
        public long JWV_JVG_Number { get; set; }
        public string? JVG_JW_VendorGroup { get; set; }
        public string? JVC_JW_VendorCategory { get; set; }
        public string? JWV_JW_VendorName { get; set; }
        public string? CurrencyCode { get; set; }
        public int NoOfLineItems { get; set; }
        public double Qty { get; set; }
        public double Amount { get; set; }
    }

    public class JOFRT_ServiceOrderDetailed_DTO
    {
        public long JOFRT_SVOH_Number { get; set; }
        public int SO_Id { get; set; }
        public int SO_CreatorCode { get; set; }
        public string? JOFRT_SVOH_ServiceOrderNo { get; set; }
        public DateTime JOFRT_SVOH_ServiceOrderDate { get; set; }
        public string? JOFRT_SVOH_Category { get; set; }
        public long JOFRT_SVOH_JW_Vendor_Number { get; set; }
        public long JWV_JVG_Number { get; set; }
        public string? JVG_JW_VendorGroup { get; set; }
        public string? JVC_JW_VendorCategory { get; set; }
        public string? JWV_JW_VendorName { get; set; }
        public string? CurrencyCode { get; set; }
        public long JOFRT_SVOI_JPRS_Number { get; set; }
        public string? JPRS_ProcessName { get; set; }
        public string? FromWH { get; set; }
        public string? ToWH { get; set; }
        public string? UOM { get; set; }
        public double Qty { get; set; }
        public double Rate { get; set; }
        public double Amount { get; set; }
    }
    #endregion

    #region page models (Create / Edit)
    public class JO_ServiceOrderCreatePage_DTO
    {
        public string ServiceType { get; set; }   // "JWI" or "FREIGHT"
        public JOJWI_ServiceOrderHead_DTO JWIHeader { get; set; }
        public List<JOJWI_ServiceOrderItem_DTO> JWIItems { get; set; }
        public JOFRT_ServiceOrderHead_DTO FreightHeader { get; set; }
        public List<JOFRT_ServiceOrderItem_DTO> FreightItems { get; set; }
    }

    public class JO_ServiceOrderUpdatePage_DTO
    {
        public string ServiceType { get; set; }   // "JWI" or "FREIGHT"
        public JOJWI_ServiceOrderHead_DTO JWIHeader { get; set; }
        public List<JOJWI_ServiceOrderItem_DTO> JWIItems { get; set; }
        public JOFRT_ServiceOrderHead_DTO FreightHeader { get; set; }
        public List<JOFRT_ServiceOrderItem_DTO> FreightItems { get; set; }
    }
    #endregion
}