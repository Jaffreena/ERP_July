using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{
    public class DeliveryNote_DTO
    {
        public long JIDNH_MS_Number { get; set; }
        public long JIDNH_JW_Customer_Number { get; set; }
        public long JIDNH_Currency_Number { get; set; }
        public long JIDNH_WH_Number { get; set; }
        public string JIDNH_PaymentTerms { get; set; }
        public string JIDNH_DeliveryTerms { get; set; }
        public string JIDNH_DeliveryMode { get; set; }
        public string JIDNH_DespatchDocument { get; set; }
        public string JIDNH_DespatchedThrough { get; set; }
        public string JIDNH_Remarks { get; set; }

        public int Result_Number { get; set; }
        public string Result_Message { get; set; }
    }
    public class ServiceOrder_DTO
    {
        public string JISVOH_ServiceOrderNo { get; set; }
        public long JISVOH_JW_Customer_Number { get; set; }
        public long JISVOH_Currency_Number { get; set; }
        public long? JISVOH_MS_Number { get; set; }
        public string JISVOH_PaymentTerms { get; set; }
        public string JISVOH_DeliveryTerms { get; set; }
        public string JISVOH_DeliveryMode { get; set; }
        public string JISVOH_Tax { get; set; }
        public string JISVOH_TDC { get; set; }
        public string JISVOH_Remarks { get; set; }

        public int Result_Number { get; set; }
        public string Result_Message { get; set; }
    }
    public class JobWorkInvoice_DFS_DTO
    {
        public long JIJWIH_JW_Customer_Number { get; set; }
        public long JIJWIH_Currency_Number { get; set; }
        public long JIJWIH_TCT_Number { get; set; }
        public string JIJWIH_PaymentTerms { get; set; }
        public string JIJWIH_PaymentMethod { get; set; }
        public string JIJWIH_Remarks { get; set; }
        public long JIJWIH_MS_Number { get; set; }

        public int Result_Number { get; set; }
        public string Result_Message { get; set; }
    }
    public class FreightServiceOrder_DTO
    {
        public long JIFRT_SVOH_Number { get; set; }
        public string JIFRT_SVOH_ServiceOrderNo { get; set; }
        public long JIFRT_SVOH_JW_Customer_Number { get; set; }
        public string JIFRT_SVOH_JW_Customer_Name { get; set; }
        public long JIFRT_SVOH_Currency_Number { get; set; }
        public long? JIFRT_SVOH_MS_Number { get; set; }
        public string JIFRT_SVOH_PaymentTerms { get; set; }
        public string JIFRT_SVOH_DeliveryTerms { get; set; }
        public string JIFRT_SVOH_DeliveryMode { get; set; }
        public string JIFRT_SVOH_Tax { get; set; }
        public string JIFRT_SVOH_TDC { get; set; }
        public string JIFRT_SVOH_Remarks { get; set; }

        public int Result_Number { get; set; }
        public string Result_Message { get; set; }
    }

    public class JobworkInvoiceServiceOrder_DTO
    {
        public long JIJWI_SVOH_Number { get; set; }
        public string JIJWI_SVOH_ServiceOrderNo { get; set; }
        public long JIJWI_SVOH_JW_Customer_Number { get; set; }
        public string JIJWI_SVOH_JW_Customer_Name { get; set; }
        public long JIJWI_SVOH_Currency_Number { get; set; }
        public long? JIJWI_SVOH_MS_Number { get; set; }
        public string JIJWI_SVOH_PaymentTerms { get; set; }
        public string JIJWI_SVOH_DeliveryTerms { get; set; }
        public string JIJWI_SVOH_DeliveryMode { get; set; }
        public string JIJWI_SVOH_Tax { get; set; }
        public string JIJWI_SVOH_TDC { get; set; }
        public string JIJWI_SVOH_Remarks { get; set; }

        public int Result_Number { get; set; }
        public string Result_Message { get; set; }
    }
    public class Conversion_DTO
    {
        public long JICNVH_Number { get; set; }
        public long JICNVH_SFT_Number { get; set; }
        public long JICNVH_WC_Number { get; set; }
        public long JICNVH_Operator { get; set; }
        public long JICNVH_PRS_Number { get; set; }
        public long JICNVH_MS_Number { get; set; }

        public int Result_Number { get; set; }
        public string Result_Message { get; set; }
    }
}
