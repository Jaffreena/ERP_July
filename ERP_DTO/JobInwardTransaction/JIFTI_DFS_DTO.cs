using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{
    public class JIFTI_DFS_DTO
    {
        public long JIFTI_DFS_JW_Customer_Number { get; set; }
        public long JIFTI_DFS_Currency_Number { get; set; }
        public long JIFTI_DFS_TCT_Number { get; set; }
        public string JIFTI_DFS_PaymentTerms { get; set; }
        public string JIFTI_DFS_PaymentMethod { get; set; }
        public string JIFTI_DFS_Remarks { get; set; }
        public long? JIFTI_DFS_MS_Number { get; set; }
        public string JIFTI_DFS_Category { get; set; }

        public int Result_Number { get; set; }
        public string Result_Message { get; set; }
    }
}
