using ERP_DTO.JobInwardTransaction;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DAO.JobInwardTransaction
{
    public class JIFTI_DFS_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JI_FreightInvoiceDB(JIFTI_DFS_DTO DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JIFTI_DFS_Save");

            // Input Parameters
            Db.AddInParameter(DbC, "@JIFTI_DFS_JW_Customer_Number", DbType.Int64, DTO.JIFTI_DFS_JW_Customer_Number);
            Db.AddInParameter(DbC, "@JIFTI_DFS_Currency_Number", DbType.Int64, DTO.JIFTI_DFS_Currency_Number);
            Db.AddInParameter(DbC, "@JIFTI_DFS_TCT_Number", DbType.Int64, DTO.JIFTI_DFS_TCT_Number);
            Db.AddInParameter(DbC, "@JIFTI_DFS_PaymentTerms", DbType.String, DTO.JIFTI_DFS_PaymentTerms);
            Db.AddInParameter(DbC, "@JIFTI_DFS_PaymentMethod", DbType.String, DTO.JIFTI_DFS_PaymentMethod);
            Db.AddInParameter(DbC, "@JIFTI_DFS_Remarks", DbType.String, DTO.JIFTI_DFS_Remarks);

            // Output Parameters
            Db.AddOutParameter(DbC, "@Result_Number", DbType.Int32, 4);
            Db.AddOutParameter(DbC, "@Result_Message", DbType.String, 200);

            DS = Db.ExecuteDataSet(DbC);

            DTO.Result_Number = Convert.ToInt32(Db.GetParameterValue(DbC, "@Result_Number"));
            DTO.Result_Message = Convert.ToString(Db.GetParameterValue(DbC, "@Result_Message"));

            return DS;
        }

        public DataSet JI_FreightInvoiceGet()
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("SP_JIFTI_DFS_Get");

            return Db.ExecuteDataSet(DbC);
        }
    }
}
