using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{
    using System;
    using System.ComponentModel.DataAnnotations;
    public class ServiceOrderDetailed_DTO
    {
        public long JISVOH_Number { get; set; }

        public int SO_Id { get; set; }

        public int SO_CreatorCode { get; set; }

        // SVO Register
        public string? JISVOH_RegNo { get; set; }
        public DateTime JISVOH_RegDate { get; set; }

        // Service Order
        public string? JISVOH_ServiceOrderNo { get; set; }
        public DateTime JISVOH_ServiceOrderDate { get; set; }

        // Customer
        public long JISVOH_JW_Customer_Number { get; set; }
        public long CUS_JCG_Number { get; set; }
        public string? JCG_JW_CustomerGroup { get; set; }
        public string? JCC_JW_CustomerCategory { get; set; }
        public string? CUS_Name { get; set; }
        public string? CurrencyCode { get; set; }

        // Item Details
        public long JISVOI_PRS_Number { get; set; }
        public long JISVOI_Item_Number { get; set; }

        public string? PRS_ProcessName { get; set; }
        public string? Segregation { get; set; }
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

        public string Qty { get; set; }

        public double UnitPrice { get; set; }

        public double Amount { get; set; }

        public DateTime? DeliveryDate { get; set; }
    }
    public class ServiceOrderSummary_DTO
    {
        public long JISVOH_Number { get; set; }

        public int SO_Id { get; set; }

        public int SO_CreatorCode { get; set; }

        public string? JISVOH_SO_No { get; set; }

        public DateTime JISVOH_SO_Date { get; set; }

        public long JISVOH_JW_Customer_Number { get; set; }

        public long CUS_JCG_Number { get; set; }

        public string? JCG_JW_CustomerGroup { get; set; }

        public string? JCC_JW_CustomerCategory { get; set; }

        public string? CUS_Name { get; set; }

        public string? CurrencyCode { get; set; }

        public string? PRS_ProcessName { get; set; }

        public string? Segregation { get; set; }

        public int NoOfLineItems { get; set; }

        public string Qty { get; set; }

        public double Amount { get; set; }
        public string? JISVOH_RegNo { get; set; }
        public DateTime JISVOH_RegDate { get; set; }
        public string? JISVOH_ServiceOrderNo { get; set; }
        public DateTime JISVOH_ServiceOrderDate { get; set; }
    }
    public class JI_ServiceOrderHead_DTO
    {
        public long JISVOH_Number { get; set; }

        [Display(Name = "SVO Register No.")]
        public string JISVOH_RegNo { get; set; }

        [Display(Name = "Date")]
        public DateTime JISVOH_RegDate { get; set; }

        [Display(Name = "Service Order No.")]
        public string JISVOH_ServiceOrderNo { get; set; }

        [Display(Name = "Service Order Date")]
        public DateTime JISVOH_ServiceOrderDate { get; set; }

        [Display(Name = "JW Customer")]
        public long JISVOH_JW_Customer_Number { get; set; }

        public string JISVOH_JW_Customer_Name { get; set; }   // Display only

        [Display(Name = "Currency")]
        public long JISVOH_Currency_Number { get; set; }

        [Display(Name = "Terms of Payment")]
        public string JISVOH_PaymentTerms { get; set; }

        [Display(Name = "Terms of Delivery")]
        public string JISVOH_DeliveryTerms { get; set; }

        [Display(Name = "Mode of Delivery")]
        public string JISVOH_DeliveryMode { get; set; }

        [Display(Name = "Tax")]
        public string JISVOH_Tax { get; set; }

        [Display(Name = "Technical delivery conditions")]
        public string JISVOH_TDC { get; set; }

        [Display(Name = "Remarks")]
        public string JISVOH_Remarks { get; set; }

        public long SVO_Id { get; set; }
        public string JISVOI_Item_Code { get; set; }
        [Display(Name = "Material Seggregation")]
        public long? JISVOH_MS_Number { get; set; }

        [Display(Name = "Category")]
        public string JISVOH_Category { get; set; } = "DELIVERY NOTE";

        [Display(Name = "Freight Service Order")]
        public string? JISVOH_Freight_Applicable { get; set; }
    }
    public class JI_ServiceOrder_DTO
    {
        public JI_ServiceOrderHead_DTO Header { get; set; } = new();
        public List<JI_ServiceOrderItem_DTO> Items { get; set; } = new();
    }
    public class JI_ServiceOrderItem_DTO
    {
        public long JISVOI_Number { get; set; }
        public long JISVOI_JISVOH_Number { get; set; }

        public long JISVOI_PRS_Number { get; set; }
        public long JISVOI_Item_Number { get; set; }

        public string JISVOI_Item_Code { get; set; }
        public string JISVOI_Item_Description { get; set; }

        public decimal JISVOI_OuterDia { get; set; }
        public decimal JISVOI_Thickness { get; set; }
        public decimal JISVOI_Length { get; set; }
        public decimal JISVOI_Width { get; set; }

        public string JISVOI_MaterialGrade { get; set; }
        public string JISVOI_ItemGroup { get; set; }

        public long JISVOI_WH_Number { get; set; }
        public long? JISVOI_FromWH { get; set; }
        public long? JISVOI_ToWH { get; set; }
        public long JISVOI_UoM_Number { get; set; }

        public double JISVOI_Qty { get; set; }
        public double JISVOI_UnitPrice { get; set; }
        public double JISVOI_Amount { get; set; }

        public DateTime? JISVOI_DeliveryDate { get; set; }

        public bool JISVOI_IsDeleted { get; set; }

        public string JISVOI_Category { get; set; }
    }

    #region new
    public class JIJWI_ServiceOrderHead_DTO
    {
        public long JIJWI_SVOH_Number { get; set; }
        public string JIJWI_SVOH_RegNo { get; set; }
        public DateTime JIJWI_SVOH_RegDate { get; set; }
        public string JIJWI_SVOH_ServiceOrderNo { get; set; }
        public DateTime JIJWI_SVOH_ServiceOrderDate { get; set; }
        public long? JIJWI_SVOH_MS_Number { get; set; }
        public long JIJWI_SVOH_JW_Customer_Number { get; set; }
        public long JIJWI_SVOH_Currency_Number { get; set; }
        public string JIJWI_SVOH_PaymentTerms { get; set; }
        public string JIJWI_SVOH_DeliveryTerms { get; set; }
        public string JIJWI_SVOH_DeliveryMode { get; set; }
        public string JIJWI_SVOH_Tax { get; set; }
        public string JIJWI_SVOH_TDC { get; set; }
        public string JIJWI_SVOH_Remarks { get; set; }
    }
    public class JIJWI_ServiceOrderItem_DTO
    {
        public long JIJWI_SVOI_Number { get; set; }
        public bool JIJWI_SVOI_IsDeleted { get; set; }
        public long JIJWI_SVOI_PRS_Number { get; set; }
        public long JIJWI_SVOI_Item_Number { get; set; }
        public long? JIJWI_SVOI_WH_Number { get; set; }
        public long JIJWI_SVOI_UoM_Number { get; set; }
        public double JIJWI_SVOI_Qty { get; set; }
        public double JIJWI_SVOI_UnitPrice { get; set; }
        public double JIJWI_SVOI_Amount { get; set; }
        public DateTime? JIJWI_SVOI_DeliveryDate { get; set; }
        public string JIJWI_SVOI_Category { get; set; }
    }
    public class JIJWI_ServiceOrder_DTO
    {
        public JIJWI_ServiceOrderHead_DTO Header { get; set; }
        public List<JIJWI_ServiceOrderItem_DTO> Items { get; set; }
    }
    public class JIFRT_ServiceOrderHead_DTO
    {
        public long JIFRT_SVOH_Number { get; set; }
        public string JIFRT_SVOH_RegNo { get; set; }
        public DateTime JIFRT_SVOH_RegDate { get; set; }
        public string JIFRT_SVOH_ServiceOrderNo { get; set; }
        public DateTime JIFRT_SVOH_ServiceOrderDate { get; set; }
        public string JIFRT_SVOH_Category { get; set; }
        public long JIFRT_SVOH_JW_Customer_Number { get; set; }
        public long JIFRT_SVOH_Currency_Number { get; set; }
        public string JIFRT_SVOH_PaymentTerms { get; set; }
        public string JIFRT_SVOH_DeliveryTerms { get; set; }
        public string JIFRT_SVOH_DeliveryMode { get; set; }
        public string JIFRT_SVOH_Tax { get; set; }
        public string JIFRT_SVOH_TDC { get; set; }
        public string JIFRT_SVOH_Remarks { get; set; }
    }
    public class JIFRT_ServiceOrderItem_DTO
    {
        public long JIFRT_SVOI_Number { get; set; }
        public bool JIFRT_SVOI_IsDeleted { get; set; }
        public string JIFRT_SVOI_Category { get; set; }
        public long JIFRT_SVOI_PRS_Number { get; set; }
        public long? JIFRT_SVOI_FromWH_Number { get; set; }
        public long? JIFRT_SVOI_ToWH_Number { get; set; }
        public long JIFRT_SVOI_UoM_Number { get; set; }
        public double JIFRT_SVOI_Qty { get; set; }
        public double JIFRT_SVOI_Rate { get; set; }
        public double JIFRT_SVOI_Amount { get; set; }
    }
    public class JIFRT_ServiceOrder_DTO
    {
        public JIFRT_ServiceOrderHead_DTO Header { get; set; }
        public List<JIFRT_ServiceOrderItem_DTO> Items { get; set; }
    }
    public class ServiceOrderCreatePage_DTO
    {
        public string ServiceType { get; set; }   // "JWI" or "FREIGHT"
        public JIJWI_ServiceOrderHead_DTO JWIHeader { get; set; }
        public List<JIJWI_ServiceOrderItem_DTO> JWIItems { get; set; }
        public JIFRT_ServiceOrderHead_DTO FreightHeader { get; set; }
        public List<JIFRT_ServiceOrderItem_DTO> FreightItems { get; set; }
    }
    #endregion

    #region register
    public class JIJWIServiceOrderSummary_DTO
    {
        public long JIJWI_SVOH_Number { get; set; }
        public int SO_Id { get; set; }
        public int SO_CreatorCode { get; set; }
        public string? JIJWI_SVOH_RegNo { get; set; }
        public DateTime JIJWI_SVOH_RegDate { get; set; }
        public string? JIJWI_SVOH_ServiceOrderNo { get; set; }
        public DateTime JIJWI_SVOH_ServiceOrderDate { get; set; }
        public long JIJWI_SVOH_JW_Customer_Number { get; set; }
        public long CUS_JCG_Number { get; set; }
        public string? JCG_JW_CustomerGroup { get; set; }
        public string? JCC_JW_CustomerCategory { get; set; }
        public string? CUS_Name { get; set; }
        public string? CurrencyCode { get; set; }
        public string? PRS_ProcessName { get; set; }
        public int NoOfLineItems { get; set; }
        public string Qty { get; set; }
        public double Amount { get; set; }
    }

    public class JIJWIServiceOrderDetailed_DTO
    {
        public long JIJWI_SVOH_Number { get; set; }
        public int SO_Id { get; set; }
        public int SO_CreatorCode { get; set; }
        public string? JIJWI_SVOH_RegNo { get; set; }
        public DateTime JIJWI_SVOH_RegDate { get; set; }
        public string? JIJWI_SVOH_ServiceOrderNo { get; set; }
        public DateTime JIJWI_SVOH_ServiceOrderDate { get; set; }
        public long JIJWI_SVOH_JW_Customer_Number { get; set; }
        public long CUS_JCG_Number { get; set; }
        public string? JCG_JW_CustomerGroup { get; set; }
        public string? JCC_JW_CustomerCategory { get; set; }
        public string? CUS_Name { get; set; }
        public string? CurrencyCode { get; set; }
        public long JIJWI_SVOI_PRS_Number { get; set; }
        public long JIJWI_SVOI_Item_Number { get; set; }
        public string? PRS_ProcessName { get; set; }
        public string? ItemGroup { get; set; }
        public string? ItemCode { get; set; }
        public string? ItemDescription { get; set; }
        public string? OuterDia { get; set; }
        public string? Thickness { get; set; }
        public string? ItemLength { get; set; }
        public string? ITM_Width { get; set; }
        public string? MaterialGrade { get; set; }
        public string? UOM { get; set; }
        public string Qty { get; set; }
        public double UnitPrice { get; set; }
        public double Amount { get; set; }
        public DateTime? DeliveryDate { get; set; }
    }

    public class JIFRTServiceOrderSummary_DTO
    {
        public long JIFRT_SVOH_Number { get; set; }
        public int SO_Id { get; set; }
        public int SO_CreatorCode { get; set; }
        public string? JIFRT_SVOH_RegNo { get; set; }
        public DateTime JIFRT_SVOH_RegDate { get; set; }
        public string? JIFRT_SVOH_ServiceOrderNo { get; set; }
        public DateTime JIFRT_SVOH_ServiceOrderDate { get; set; }
        public long JIFRT_SVOH_JW_Customer_Number { get; set; }
        public long CUS_JCG_Number { get; set; }
        public string? JCG_JW_CustomerGroup { get; set; }
        public string? JCC_JW_CustomerCategory { get; set; }
        public string? CUS_Name { get; set; }
        public string? CurrencyCode { get; set; }
        public int NoOfLineItems { get; set; }
        public string Qty { get; set; }
        public double Amount { get; set; }
    }

    public class JIFRTServiceOrderDetailed_DTO
    {
        public long JIFRT_SVOH_Number { get; set; }
        public int SO_Id { get; set; }
        public int SO_CreatorCode { get; set; }
        public string? JIFRT_SVOH_RegNo { get; set; }
        public DateTime JIFRT_SVOH_RegDate { get; set; }
        public string? JIFRT_SVOH_ServiceOrderNo { get; set; }
        public DateTime JIFRT_SVOH_ServiceOrderDate { get; set; }
        public long JIFRT_SVOH_JW_Customer_Number { get; set; }
        public long CUS_JCG_Number { get; set; }
        public string? JCG_JW_CustomerGroup { get; set; }
        public string? JCC_JW_CustomerCategory { get; set; }
        public string? CUS_Name { get; set; }
        public string? CurrencyCode { get; set; }
        public long JIFRT_SVOI_PRS_Number { get; set; }
        public string? FromWH { get; set; }
        public string? ToWH { get; set; }
        public string? UOM { get; set; }
        public string Qty { get; set; }
        public double Rate { get; set; }
        public double Amount { get; set; }
    }
    #endregion

}
