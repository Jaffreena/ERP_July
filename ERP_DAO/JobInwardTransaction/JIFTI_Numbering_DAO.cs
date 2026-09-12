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
    public class JIFTI_Numbering_DAO
    {
        DBConnect DB = new DBConnect();
        DataSet DS = new DataSet();

        public DataSet JIFTI_NumberingDB(JIFTI_Numbering_DTO P_DTO)
        {
            Database Db = new SqlDatabase(DB.Connection());
            DbCommand DbC = Db.GetStoredProcCommand("JIFTI_Numbering_SP");

            Db.AddInParameter(DbC, "@JIFTI_Number", DbType.Int64, P_DTO.JIFTI_Number);
            Db.AddInParameter(DbC, "@JIFTI_Method", DbType.Int64, P_DTO.JIFTI_Method);
            Db.AddInParameter(DbC, "@JIFTI_Date", DbType.Int32, P_DTO.JIFTI_Date);
            Db.AddInParameter(DbC, "@JIFTI_EndDate", DbType.Int32, P_DTO.JIFTI_EndDate);
            Db.AddInParameter(DbC, "@JIFTI_StartingNumber", DbType.Int32, P_DTO.JIFTI_StartingNumber);
            Db.AddInParameter(DbC, "@JIFTI_NumberofDigits", DbType.Int32, P_DTO.JIFTI_NumberofDigits);
            Db.AddInParameter(DbC, "@JIFTI_PrefilZero", DbType.Int64, P_DTO.JIFTI_PrefilZero);
            Db.AddInParameter(DbC, "@JIFTI_Frequency", DbType.Int64, P_DTO.JIFTI_Frequency);
            Db.AddInParameter(DbC, "@JIFTI_Particulars", DbType.String, P_DTO.JIFTI_Particulars);

            Db.AddInParameter(DbC, "@DeleteNumbers", DbType.String, P_DTO.DeleteNumbers);

            Db.AddInParameter(DbC, "@CreatorCode", DbType.Int32, P_DTO.CreatorCode);
            Db.AddInParameter(DbC, "@Id", DbType.Int32, P_DTO.Id);

            DS = Db.ExecuteDataSet(DbC);
            return DS;
        }
    }
}
