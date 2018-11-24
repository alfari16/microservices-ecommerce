<div class="login">
<?php echo form_open('login/signup'); ?>
    <p class="title text-center login-title">Daftar</p>
    <input placeholder="Nama" class="form-control" type="text" name="nama" required>
    <input placeholder="Username" class="form-control" type="text" name="username" required>
    <input placeholder="Password" class="form-control" type="password" name="password" required>
    <?php echo validation_errors();?>
<?php if(isset($notfound)){?>
    <p class="text-center text-danger mt-3">Username sudah dipakai.</p>
<?php }?>
    <p class="text-center text-mute mt-3">Sudah punya akun? <a href="<?php echo base_url(); ?>login">Login</a>.</p>
    <input class="btn form-control mt-3" type="submit" value="Daftar">
<?php echo form_close();?>
</div>